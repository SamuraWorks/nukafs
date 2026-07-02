"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  Student,
  PendingRegistration,
  EditRequest,
  NUKaFsEvent,
  Announcement,
  AuditEntry,
  TeamMember,
  Opportunity,
  RequestStatus,
} from "@/lib/mock-data"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import {
  readStorage,
  readString,
  writeString,
  removeStorage,
} from "@/lib/storage/persistence"
import { createMembershipIdentity } from "@/lib/membership"
import {
  signInWithPassword,
  signUpWithPassword,
  signOut,
  getCurrentSession,
  mapUserMetadataToRole,
} from "@/lib/supabase/auth"
import {
  fetchAnnouncements,
  fetchEvents,
  fetchOpportunities,
  fetchUniversities,
  fetchPendingRegistrations,
  fetchEditRequests,
  fetchStudents,
  createRegistration,
  fetchRegistrySnapshot,
} from "@/lib/supabase/registry"
import { supabase } from "@/lib/supabase/client"

export type AppRole = "guest" | "student_pending" | "student_active_wizard" | "student_active_complete" | "executive" | "stakeholder" | "super_admin"

export interface UserNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  category:
    | "registration"
    | "profile"
    | "announcement"
    | "event"
    | "scholarship"
    | "opportunity"
    | "system"
  read: boolean
  timestamp: string
}

export interface SystemSettings {
  systemName: string
  systemLogo: string
  systemDescription: string
  registrationStatus: "Open" | "Closed"
  approvalWorkflow: "Manual" | "Automatic"
  maintenanceMode: boolean
  defaultUserRole: string
  membershipNumberFormat: string
  profileCompletionRules: string[]
  passwordPolicy: string
  sessionTimeout: string
  language: string
  timeZone: string
  dateFormat: string
  theme: string
}

const defaultSettings: SystemSettings = {
  systemName: "NUKaFs Registry",
  systemLogo: "",
  systemDescription: "The official registry for students of Koinadugu and Falaba districts.",
  registrationStatus: "Open",
  approvalWorkflow: "Manual",
  maintenanceMode: false,
  defaultUserRole: "student",
  membershipNumberFormat: "NUKaFs-YYYY-XXXX",
  profileCompletionRules: ["academic_info", "personal_info", "emergency_contact"],
  passwordPolicy: "Medium (8+ characters, letters and numbers)",
  sessionTimeout: "30 minutes",
  language: "en-US",
  timeZone: "GMT",
  dateFormat: "YYYY-MM-DD",
  theme: "light"
}

const isSupabaseEnabled =
  typeof process !== "undefined" &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function persistToStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors in the browser
  }
}

function mapSupabaseRole(role: string | undefined): AppRole {
  switch (role) {
    case "student_pending":
      return "student_pending"
    case "student_active_wizard":
      return "student_active_wizard"
    case "student_active_complete":
      return "student_active_complete"
    case "executive":
      return "executive"
    case "stakeholder":
      return "stakeholder"
    case "super_admin":
      return "super_admin"
    default:
      return "guest"
  }
}

interface AppStateContextProps {
  currentRole: AppRole
  currentUser: any // Can be Student or TeamMember
  students: Student[]
  pendingRegistrations: PendingRegistration[]
  editRequests: EditRequest[]
  events: NUKaFsEvent[]
  announcements: Announcement[]
  opportunities: Opportunity[]
  teamMembers: TeamMember[]
  auditLog: AuditEntry[]
  notifications: UserNotification[]
  registeredEvents: string[] // IDs of events registered by active student
  systemSettings: SystemSettings
  universitiesList: string[]
  
  // Actions
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string; role?: AppRole }>
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string; role?: AppRole }>
  submitProfileWizard: (details: Partial<Student>) => void
  requestProfileUpdate: (fields: { field: string; newValue: string }[], reason: string) => void
  approveRegistration: (id: string) => Promise<void>
  rejectRegistration: (id: string, reason?: string) => void
  approveEditRequest: (id: string) => void
  rejectEditRequest: (id: string) => void
  requestMoreInfoEditRequest: (id: string) => void
  toggleEventRegistration: (id: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
  addAnnouncement: (title: string, category: string, body: string) => void
  editAnnouncement: (id: string, details: Partial<Announcement>) => void
  deleteAnnouncement: (id: string) => void
  addEvent: (title: string, date: string, time: string, location: string, description: string) => void
  editEvent: (id: string, details: Partial<NUKaFsEvent>) => void
  cancelEvent: (id: string) => void
  deleteEvent: (id: string) => void
  addOpportunity: (opp: Omit<Opportunity, "id">) => void
  editOpportunity: (id: string, details: Partial<Opportunity>) => void
  deleteOpportunity: (id: string) => void
  addTeamMember: (member: Omit<TeamMember, "id">) => void
  editTeamMember: (id: string, details: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void
  updateSettings: (settings: Partial<SystemSettings>) => void
  suspendStudent: (id: string) => void
  reactivateStudent: (id: string) => void
  deleteStudent: (id: string) => void
  updateStudent: (id: string, details: Partial<Student>) => void
  resetStudentPassword: (id: string) => void
  updateUniversitiesList: (list: string[]) => void
  switchRole: (role: AppRole) => void
  logout: () => void
  refreshCurrentUser: () => Promise<any | null>
  updateCurrentUserContext: (user: any) => void
  isHydrated: boolean
  addAuditLogEntry: (actor: string, action: string, target: string, type: "create" | "update" | "delete" | "approve" | "login") => void
  addNotification: (title: string, message: string, type: "info" | "success" | "warning" | "error") => void
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined)

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

const defaultNotifications: UserNotification[] = [
  {
    id: "notif_1",
    title: "Welcome to NUKaFs Registry",
    message: "Your registry account has been approved and is fully active.",
    type: "success",
    category: "registration",
    read: false,
    timestamp: "2026-06-26 12:00",
  },
  {
    id: "notif_2",
    title: "Profile Verification Complete",
    message: "Your profile has been reviewed and verified by the executive team.",
    type: "success",
    category: "profile",
    read: false,
    timestamp: "2026-06-26 13:00",
  },
  {
    id: "notif_3",
    title: "Scholarship Opportunity",
    message: "Njala University Scholarship application is closing soon.",
    type: "info",
    category: "scholarship",
    read: false,
    timestamp: "2026-06-26 14:00",
  },
  {
    id: "notif_4",
    title: "Annual General Meeting",
    message: "AGM details have been published. Review the announcement for venue and agenda.",
    type: "info",
    category: "announcement",
    read: true,
    timestamp: "2026-06-25 09:00",
  },
  {
    id: "notif_5",
    title: "Career Fair Reminder",
    message: "The NUKaFs Career Fair starts tomorrow at Fourah Bay College.",
    type: "warning",
    category: "event",
    read: true,
    timestamp: "2026-06-24 16:00",
  },
  {
    id: "notif_6",
    title: "Internship Placement Available",
    message: "A new internship opportunity with a partner NGO has been posted.",
    type: "info",
    category: "opportunity",
    read: false,
    timestamp: "2026-06-23 11:00",
  },
  {
    id: "notif_7",
    title: "System Maintenance Scheduled",
    message: "Registry maintenance is planned for Sunday 02:00–04:00 GMT.",
    type: "warning",
    category: "system",
    read: true,
    timestamp: "2026-06-22 08:00",
  },
]

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentRole, setCurrentRole] = useState<AppRole>("guest")
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [students, setStudents] = useState<Student[]>([])
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [editRequests, setEditRequests] = useState<EditRequest[]>([])
  const [events, setEvents] = useState<NUKaFsEvent[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSettings)
  const [universitiesList, setUniversitiesList] = useState<string[]>([])
  const [notifications, setNotifications] = useState<UserNotification[]>(defaultNotifications)

  const refreshRegistryData = useCallback(async () => {
    if (!isSupabaseEnabled) return

    try {
      const snapshot = await fetchRegistrySnapshot()
      setStudents((snapshot.students ?? []) as Student[])
      setPendingRegistrations((snapshot.pendingRegistrations ?? []) as PendingRegistration[])
      setEditRequests((snapshot.editRequests ?? []) as EditRequest[])
      setAnnouncements((snapshot.announcements ?? []) as Announcement[])
      setEvents((snapshot.events ?? []) as NUKaFsEvent[])
      setOpportunities((snapshot.opportunities ?? []) as Opportunity[])
      setUniversitiesList((snapshot.universities ?? []) as string[])
    } catch (error) {
      console.error("Supabase refresh failed:", error)
    }
  }, [])

  // Load persisted state or seed mock data on mount
  useEffect(() => {
    async function restoreState() {
      if (isSupabaseEnabled) {
        try {
          const session = await getCurrentSession()
          const role = mapSupabaseRole(session.role)

          if (session.user) {
            setCurrentUser(session.user)
            setCurrentRole(role)
            writeString(STORAGE_KEYS.role, role)
            persistToStorage(STORAGE_KEYS.user, session.user)
          } else {
            setCurrentRole("guest")
            setCurrentUser(null)
          }

          await refreshRegistryData()
        } catch (error) {
          console.error("Supabase restore failed:", error)
          setStudents([])
          setPendingRegistrations([])
          setEditRequests([])
          setAnnouncements([])
          setEvents([])
          setOpportunities([])
          setUniversitiesList([])
        }
      } else {
        console.warn("Supabase is not configured. Production backend is required to run the registry.")

        setCurrentRole("guest")
        setCurrentUser(null)
        setStudents([])
        setPendingRegistrations([])
        setEditRequests([])
        setAnnouncements([])
        setUniversitiesList([])
        setEvents([])
        setOpportunities([])
        setTeamMembers([])
        setAuditLog([])
        setRegisteredEvents([])
      }

      const localNotifs = readStorage<UserNotification[] | null>(
        STORAGE_KEYS.notifications,
        null,
      )
      if (localNotifs) {
        setNotifications(
          localNotifs.map((n) => ({
            ...n,
            category: n.category ?? "system",
          })),
        )
      }

      const localSettings = readStorage<SystemSettings | null>(
        STORAGE_KEYS.settings,
        null,
      )
      if (localSettings) setSystemSettings(localSettings)

      setIsHydrated(true)
    }

    restoreState()
  }, [refreshRegistryData])

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return

    const channel = supabase.channel("registry-live-sync")

    const tables = ["users", "registrations", "announcements", "events", "opportunities", "edit_requests", "universities"]
    tables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void refreshRegistryData()
      })
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshRegistryData])

  const persistState = (key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], data: unknown) => {
    persistToStorage(key, data)
  }

  const refreshCurrentUser = useCallback(async () => {
    try {
      const session = await getCurrentSession()
      const role = mapSupabaseRole(session.role)

      setCurrentRole(role)
      setCurrentUser(session.user)
      persistToStorage(STORAGE_KEYS.user, session.user)
      writeString(STORAGE_KEYS.role, role)
      writeString(STORAGE_KEYS.sessionTimestamp, String(Date.now()))

      return session.user
    } catch (error) {
      console.error("Failed to refresh current user session:", error)
      return null
    }
  }, [])

  const handleSetRole = (role: AppRole) => {
    setCurrentRole(role)
    writeString(STORAGE_KEYS.role, role)
    writeString(STORAGE_KEYS.sessionTimestamp, String(Date.now()))

    if (currentUser?.id) {
      const syncedUser = {
        ...currentUser,
        role,
        status: currentUser?.status ?? "active",
        roleLabel: role === "super_admin" ? "Super Admin" : role === "executive" ? "Executive" : role === "stakeholder" ? "Stakeholder" : currentUser?.roleLabel,
      }
      setCurrentUser(syncedUser)
      persistToStorage(STORAGE_KEYS.user, syncedUser)
      return
    }

    setCurrentUser(null)
    removeStorage(STORAGE_KEYS.user)
  }

  const updateCurrentUserContext = useCallback((user: any) => {
    setCurrentUser(user)
    persistToStorage(STORAGE_KEYS.user, user)
  }, [])

  // Auth Operations
  const login = async (emailOrPhone: string, password?: string) => {
    if (!password) {
      return { success: false, error: "Password is required." }
    }

    if (!isSupabaseEnabled) {
      return {
        success: false,
        error: "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      }
    }

    const result = await signInWithPassword(emailOrPhone, password)
    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.requiresPasswordChange
          ? (result.message ?? "Password change required before access is granted.")
          : (result.message ?? "Login failed"),
      }
    }

    const role = mapSupabaseRole(result.role)
    setCurrentRole(role)
    setCurrentUser(result.user)
    persistToStorage(STORAGE_KEYS.user, result.user)
    writeString(STORAGE_KEYS.role, role)
    writeString(STORAGE_KEYS.sessionTimestamp, String(Date.now()))

    addAuditLogEntry(result.user.full_name ?? result.user.email ?? "User", "signed in", "Student Dashboard", "login")

    return { success: true, role }
  }

  const register = async (name: string, email: string, phone: string, password: string) => {
    if (!isSupabaseEnabled) {
      return {
        success: false,
        error: "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      }
    }

    const result = await signUpWithPassword(name, email, password, phone)
    if (!result.success || !result.user) {
      return { success: false, error: result.message ?? "Registration failed" }
    }

    const role = mapSupabaseRole(result.role)
    setCurrentRole(role)
    setCurrentUser(result.user)
    persistToStorage(STORAGE_KEYS.user, result.user)
    writeString(STORAGE_KEYS.role, role)
    writeString(STORAGE_KEYS.sessionTimestamp, String(Date.now()))

    addAuditLogEntry(name, "created account", "Account Registration", "create")

    return { success: true, role }
  }

  // Profile Wizard completion
  const submitProfileWizard = async (details: Partial<Student>) => {
    if (!currentUser) return

    const fullName = details.fullName || currentUser.fullName || currentUser.name || "Unknown Student"
    const phone = details.phone || currentUser.phone || "+232 76 000 000"
    const district = (details.district as Student["district"]) || "Koinadugu"

    try {
      await createRegistration({
        user_id: currentUser.id,
        full_name: fullName,
        email: currentUser.email,
        phone,
        district,
        submitted_date: new Date().toISOString().split("T")[0],
        status: "pending",
      })
    } catch (error) {
      console.error("Unable to create pending registration:", error)
    }

    const pendingRegistration: PendingRegistration = {
      id: `pr_${Date.now()}`,
      fullName,
      name: fullName,
      email: currentUser.email,
      phone,
      district,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      role: (details.employmentStatus === "Student" ? "student" : "graduate") as "student" | "graduate",
      profile: {
        ...details,
        fullName,
        email: currentUser.email,
        phone,
        district,
      },
      university: details.university,
      department: details.department,
      course: details.course,
      level: details.level,
      employmentStatus: details.employmentStatus || "Student",
    }

    const updatedPending = [pendingRegistration, ...pendingRegistrations]
    setPendingRegistrations(updatedPending)
    persistToStorage(STORAGE_KEYS.pending, updatedPending)

    const updatedUser = { ...currentUser, fullName, phone, status: "pending", role: "student_pending" }
    setCurrentUser(updatedUser)
    persistToStorage(STORAGE_KEYS.user, updatedUser)
    setCurrentRole("student_pending")
    writeString(STORAGE_KEYS.role, "student_pending")

    addAuditLogEntry(fullName, "completed profile setup", "Student Registry", "update")
    addNotification("Application Submitted", "Your profile has been submitted for review. You will receive your digital identity once approved.", "success")
  }

  // Direct profile edit (no approval workflow)
  const requestProfileUpdate = async (fields: { field: string; newValue: string }[], reason: string) => {
    if (!currentUser) return

    try {
      const normalizedProfile: Record<string, unknown> = {}

      fields.forEach((field) => {
        const key = field.field.toLowerCase().replace(/\s+/g, "")
        const normalizedKey =
          key === "fullname"
            ? "fullName"
            : key === "phonenumber"
              ? "phone"
              : key === "courseofstudy"
                ? "courseName"
                : key === "academiclevel"
                  ? "academicLevel"
                  : key === "studentidnumber"
                    ? "studentId"
                    : key === "dateofbirth"
                      ? "dob"
                      : key === "homeaddress"
                        ? "homeAddress"
                        : key === "currentaddress"
                          ? "currentAddress"
                          : key

        normalizedProfile[normalizedKey] = field.newValue
      })

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          profile: normalizedProfile,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update profile")
      }

      const updatedUser = { ...currentUser, ...normalizedProfile }
      setCurrentUser(updatedUser)
      persistToStorage(STORAGE_KEYS.user, updatedUser)
      await refreshCurrentUser()
      await refreshRegistryData()

      addAuditLogEntry(
        currentUser.fullName || currentUser.name || "User",
        "updated profile directly",
        `${fields.length} field(s)` ,
        "update"
      )
      addNotification(
        "Profile Updated",
        "Your profile changes were saved immediately.",
        "success"
      )
    } catch (error) {
      console.error("Error updating profile directly:", error)
      addNotification(
        "Profile Update Error",
        "There was an error saving your profile changes.",
        "error"
      )
    }
  }

  // Executive Operations
  const approveRegistration = async (id: string) => {
    const item = pendingRegistrations.find(p => p.id === id)
    if (!item) return

    const profile = (item.profile ?? {}) as Partial<Student> & Record<string, unknown>
    const fullName = item.fullName || item.name || String(profile.fullName || "")
    const employmentStatus = String(profile.employmentStatus || item.employmentStatus || "Student")
    const membershipType = employmentStatus === "Student" ? "student" : "student"
    const targetUserId = String((item as any).user_id ?? (item as any).userId ?? item.id)

    try {
      // Step 1: Call the production membership ID allocation API
      // This atomically assigns the next sequential ID and creates the permanent identity record
      // Only called on FIRST approval - the API will reject subsequent calls
      const idRes = await fetch("/api/membership-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, membershipType }),
      })

      if (!idRes.ok) {
        console.error("Failed to allocate membership ID:", await idRes.text())
        addNotification("Approval Failed", `Could not assign membership ID for ${fullName}.`, "error")
        return
      }

      const { identity } = await idRes.json()

      // Step 2: Update the user record in the database: set status=active, verification_status=verified
      // NOTE: QR Code and membership number are generated ONLY during first approval (Step 1)
      // They NEVER change due to profile edits, password changes, or login/logout
      const updateRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          profile: {
            status: "active",
            verificationStatus: "verified",
            role: employmentStatus === "Student" ? "student_active_complete" : "student_active_complete",
            dateApproved: new Date().toISOString().split("T")[0],
            membershipNumber: identity.membershipId,
            qrCode: identity.qrCodeData,
          },
        }),
      })

      if (!updateRes.ok) {
        console.error("Failed to update user status:", await updateRes.text())
      }

      // Step 3: Update local state
      const updatedPending = pendingRegistrations.filter(p => p.id !== id)
      setPendingRegistrations(updatedPending)
      persistToStorage(STORAGE_KEYS.pending, updatedPending)

      await refreshRegistryData()

      const execName = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
      addAuditLogEntry(execName, "approved registration", fullName, "approve")
      addNotification(
        "Registration Approved",
        `Account for ${fullName} has been approved. Membership ID: ${identity.membershipId}. QR code generated and is now permanent.`,
        "success"
      )
    } catch (error) {
      console.error("approveRegistration error:", error)
      addNotification("Approval Error", `An unexpected error occurred while approving ${fullName}.`, "error")
    }
  }

  const rejectRegistration = (id: string, reason?: string) => {
    const item = pendingRegistrations.find(p => p.id === id)
    if (!item) return

    const updatedPending = pendingRegistrations.filter(p => p.id !== id)
    setPendingRegistrations(updatedPending)
    persistToStorage(STORAGE_KEYS.pending, updatedPending)
    void refreshRegistryData()

    const execName = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(execName, `rejected registration${reason ? ` (Reason: ${reason})` : ""}`, item.fullName, "delete")
    addNotification("Registration Rejected", `Account registration for ${item.fullName} was rejected.`, "warning")
  }

  const approveEditRequest = async (id: string) => {
    const req = editRequests.find(r => r.id === id)
    if (!req) return

    const updatedStudents = students.map(s => {
      if (s.membershipNumber === req.membershipNumber) {
        let key = req.field.toLowerCase().replace(" ", "")
        if (key === "fullname") key = "fullName"
        if (key === "phonenumber") key = "phone"
        return { ...s, [key]: req.newValue }
      }
      return s
    })
    
    setStudents(updatedStudents)
    persistToStorage(STORAGE_KEYS.students, updatedStudents)

    const updatedRequests = editRequests.map(r => 
      r.id === id ? { ...r, status: "approved" as RequestStatus, reviewedDate: new Date().toISOString().split("T")[0] } : r
    )
    setEditRequests(updatedRequests)
    persistToStorage(STORAGE_KEYS.editRequests, updatedRequests)

    await refreshRegistryData()

    const execName = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(execName, "approved profile update", `${req.studentName} (${req.field})`, "approve")
    
    if (currentUser && currentUser.membershipNumber === req.membershipNumber) {
      let key = req.field.toLowerCase().replace(" ", "")
      if (key === "fullname") key = "fullName"
      if (key === "phonenumber") key = "phone"
      const updatedUser = { ...currentUser, [key]: req.newValue }
      setCurrentUser(updatedUser)
      persistToStorage(STORAGE_KEYS.user, updatedUser)
    }
  }

  const rejectEditRequest = (id: string) => {
    const req = editRequests.find(r => r.id === id)
    if (!req) return

    const updatedRequests = editRequests.map(r => 
      r.id === id ? { ...r, status: "rejected" as RequestStatus, reviewedDate: new Date().toISOString().split("T")[0] } : r
    )
    setEditRequests(updatedRequests)
    persistToStorage(STORAGE_KEYS.editRequests, updatedRequests)

    const execName = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(execName, "rejected profile update", `${req.studentName} (${req.field})`, "delete")
  }

  const requestMoreInfoEditRequest = (id: string) => {
    const req = editRequests.find(r => r.id === id)
    if (!req) return

    const updatedRequests = editRequests.map(r => 
      r.id === id ? { ...r, reason: `${r.reason} (Info requested: Please upload supporting documentation)` } : r
    )
    setEditRequests(updatedRequests)
    persistToStorage(STORAGE_KEYS.editRequests, updatedRequests)

    const execName = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(execName, "requested more information", `${req.studentName} (${req.field})`, "update")
  }

  // Event RSVP
  const toggleEventRegistration = (id: string) => {
    let updated: string[] = []
    let nextEvents = [...events]
    if (registeredEvents.includes(id)) {
      updated = registeredEvents.filter(e => e !== id)
      nextEvents = events.map(ev => ev.id === id ? { ...ev, attendees: Math.max(0, ev.attendees - 1) } : ev)
    } else {
      updated = [...registeredEvents, id]
      nextEvents = events.map(ev => ev.id === id ? { ...ev, attendees: ev.attendees + 1 } : ev)
    }
    setRegisteredEvents(updated)
    setEvents(nextEvents)
    persistToStorage(STORAGE_KEYS.registeredEvents, updated)
    persistToStorage(STORAGE_KEYS.events, nextEvents)
  }

  // Announcement operations
  const addAnnouncement = (title: string, category: string, body: string) => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      category: category as any,
      body,
      author: currentUser ? (currentUser.name || currentUser.fullName) : "Executive",
      date: new Date().toISOString().split("T")[0]
    }
    const updated = [newAnn, ...announcements]
    setAnnouncements(updated)
    persistToStorage(STORAGE_KEYS.announcements, updated)

    addAuditLogEntry(newAnn.author, "published announcement", title, "create")
  }

  const editAnnouncement = (id: string, details: Partial<Announcement>) => {
    const updated = announcements.map(ann => ann.id === id ? { ...ann, ...details } : ann)
    setAnnouncements(updated)
    persistToStorage(STORAGE_KEYS.announcements, updated)
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "updated announcement", details.title || id, "update")
  }

  const deleteAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id)
    const updated = announcements.filter(ann => ann.id !== id)
    setAnnouncements(updated)
    persistToStorage(STORAGE_KEYS.announcements, updated)
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "deleted announcement", ann?.title || id, "delete")
  }

  // Event operations
  const addEvent = (title: string, date: string, time: string, location: string, description: string) => {
    const newEvt: NUKaFsEvent = {
      id: `evt_${Date.now()}`,
      title,
      date,
      time,
      location,
      description,
      status: "upcoming",
      attendees: 0
    }
    const updated = [newEvt, ...events]
    setEvents(updated)
    persistToStorage(STORAGE_KEYS.events, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "created event", title, "create")
  }

  const editEvent = (id: string, details: Partial<NUKaFsEvent>) => {
    const updated = events.map(e => e.id === id ? { ...e, ...details } : e)
    setEvents(updated)
    persistToStorage(STORAGE_KEYS.events, updated)
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "updated event", details.title || id, "update")
  }

  const cancelEvent = (id: string) => {
    const updated = events.map(e => e.id === id ? { ...e, status: "past" as any } : e) // or custom cancel status
    setEvents(updated)
    persistToStorage(STORAGE_KEYS.events, updated)
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "cancelled event", id, "update")
  }

  const deleteEvent = (id: string) => {
    const ev = events.find(e => e.id === id)
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    persistToStorage(STORAGE_KEYS.events, updated)
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "deleted event", ev?.title || id, "delete")
  }

  // Opportunity operations
  const addOpportunity = (opp: Omit<Opportunity, "id">) => {
    const newOpp: Opportunity = {
      id: `opp_${Date.now()}`,
      ...opp
    }
    const updated = [newOpp, ...opportunities]
    setOpportunities(updated)
    persistToStorage(STORAGE_KEYS.opportunities, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, `published opportunity (${opp.type})`, opp.title, "create")
  }

  const editOpportunity = (id: string, details: Partial<Opportunity>) => {
    const updated = opportunities.map(o => o.id === id ? { ...o, ...details } : o)
    setOpportunities(updated)
    persistToStorage(STORAGE_KEYS.opportunities, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "updated opportunity", details.title || id, "update")
  }

  const deleteOpportunity = (id: string) => {
    const opp = opportunities.find(o => o.id === id)
    const updated = opportunities.filter(o => o.id !== id)
    setOpportunities(updated)
    persistToStorage(STORAGE_KEYS.opportunities, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "deleted opportunity", opp?.title || id, "delete")
  }

  // Team Member operations
  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      ...member
    }
    const updated = [...teamMembers, newMember]
    setTeamMembers(updated)
    persistToStorage(STORAGE_KEYS.teamMembers, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Super Admin"
    addAuditLogEntry(actor, `invited team member (${member.role})`, member.name, "create")
  }

  const editTeamMember = (id: string, details: Partial<TeamMember>) => {
    const updated = teamMembers.map(m => m.id === id ? { ...m, ...details } : m)
    setTeamMembers(updated)
    persistToStorage(STORAGE_KEYS.teamMembers, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Super Admin"
    addAuditLogEntry(actor, "updated team member settings", details.name || id, "update")
  }

  const deleteTeamMember = (id: string) => {
    const member = teamMembers.find(m => m.id === id)
    const updated = teamMembers.filter(m => m.id !== id)
    setTeamMembers(updated)
    persistToStorage(STORAGE_KEYS.teamMembers, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Super Admin"
    addAuditLogEntry(actor, "removed team member access", member?.name || id, "delete")
  }

  // System Settings operations
  const updateSettings = (settings: Partial<SystemSettings>) => {
    const updated = { ...systemSettings, ...settings }
    setSystemSettings(updated)
    persistToStorage(STORAGE_KEYS.settings, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Super Admin"
    addAuditLogEntry(actor, "updated system configurations", "System Preferences", "update")
  }

  // Student management operations
  const suspendStudent = (id: string) => {
    const updated = students.map(s => s.id === id ? { ...s, status: "suspended" as any } : s)
    setStudents(updated)
    persistToStorage(STORAGE_KEYS.students, updated)

    const target = students.find(s => s.id === id)?.fullName || id
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "suspended student registry account", target, "update")
    addNotification("Account Suspended", `Student account for ${target} has been suspended.`, "warning")
  }

  const reactivateStudent = (id: string) => {
    const updated = students.map(s => s.id === id ? { ...s, status: "active" as any } : s)
    setStudents(updated)
    persistToStorage(STORAGE_KEYS.students, updated)

    const target = students.find(s => s.id === id)?.fullName || id
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "reactivated student registry account", target, "update")
    addNotification("Account Reactivated", `Student account for ${target} has been reactivated.`, "success")
  }

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id)?.fullName || id
    const updated = students.filter(s => s.id !== id)
    setStudents(updated)
    persistToStorage(STORAGE_KEYS.students, updated)

    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Super Admin"
    addAuditLogEntry(actor, "deleted student from registry", target, "delete")
    addNotification("Account Deleted", `Registry record for ${target} has been permanently deleted.`, "error")
  }

  const updateStudent = (id: string, details: Partial<Student>) => {
    const updated = students.map(s => s.id === id ? { ...s, ...details } : s)
    setStudents(updated)
    persistToStorage(STORAGE_KEYS.students, updated)

    const target = students.find(s => s.id === id)?.fullName || id
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
    addAuditLogEntry(actor, "manually edited student details", target, "update")
  }

  const resetStudentPassword = (id: string) => {
    const target = students.find(s => s.id === id)?.fullName || id
    const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Admin"
    addAuditLogEntry(actor, "triggered manual student password reset", target, "update")
  }

  const updateUniversitiesList = (list: string[]) => {
    setUniversitiesList(list)
    persistToStorage(STORAGE_KEYS.universities, list)
  }

  // Helpers
  const addAuditLogEntry = (actor: string, action: string, target: string, type: any) => {
    const newLog: AuditEntry = {
      id: `log_${Date.now()}`,
      actor,
      action,
      target,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      type
    }
    const updatedLogs = [newLog, ...auditLog]
    setAuditLog(updatedLogs)
    persistToStorage(STORAGE_KEYS.auditLog, updatedLogs)
  }

  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error", category: UserNotification["category"] = "system") => {
    const newNotif: UserNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      category,
      read: false,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16)
    }
    const updated = [newNotif, ...notifications]
    setNotifications(updated)
    persistToStorage(STORAGE_KEYS.notifications, updated)
  }

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifications(updated)
    persistToStorage(STORAGE_KEYS.notifications, updated)
  }

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    persistToStorage(STORAGE_KEYS.notifications, updated)
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    persistToStorage(STORAGE_KEYS.notifications, updated)
  }

  const logout = async () => {
    await signOut()
    setCurrentRole("guest")
    setCurrentUser(null)
    removeStorage(STORAGE_KEYS.role)
    removeStorage(STORAGE_KEYS.user)
    removeStorage(STORAGE_KEYS.sessionTimestamp)
    removeStorage(STORAGE_KEYS.selectedPortal)
    removeStorage(STORAGE_KEYS.lastPath)
    removeStorage(STORAGE_KEYS.accessToken)
    removeStorage(STORAGE_KEYS.refreshToken)
    removeStorage(STORAGE_KEYS.csrfToken)
  }

  const switchRole = (role: AppRole) => {
    handleSetRole(role)
  }

  return (
    <AppStateContext.Provider
      value={{
        currentRole,
        currentUser,
        students,
        pendingRegistrations,
        editRequests,
        events,
        announcements,
        opportunities,
        teamMembers,
        auditLog,
        notifications,
        registeredEvents,
        systemSettings,
        universitiesList,
        login,
        register,
        submitProfileWizard,
        requestProfileUpdate,
        approveRegistration,
        rejectRegistration,
        approveEditRequest,
        rejectEditRequest,
        requestMoreInfoEditRequest,
        toggleEventRegistration,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addAnnouncement,
        editAnnouncement,
        deleteAnnouncement,
        addEvent,
        editEvent,
        cancelEvent,
        deleteEvent,
        addOpportunity,
        editOpportunity,
        deleteOpportunity,
        addTeamMember,
        editTeamMember,
        deleteTeamMember,
        updateSettings,
        suspendStudent,
        reactivateStudent,
        deleteStudent,
        updateStudent,
        resetStudentPassword,
        updateUniversitiesList,
        switchRole,
        logout,
        refreshCurrentUser,
        updateCurrentUserContext,
        isHydrated,
        addAuditLogEntry,
        addNotification
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider")
  }
  return context
}
