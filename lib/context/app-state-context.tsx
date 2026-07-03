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
} from "@/lib/types/registry"
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

function normalizeApiUser(user: Record<string, any>): any {
  if (!user) return user

  return {
    ...user,
    fullName: user.full_name ?? user.fullName ?? user.name,
    name: user.full_name ?? user.fullName ?? user.name,
    profilePhotoUrl: user.profile_photo_url ?? user.profilePhotoUrl,
    profilePhotoPath: user.profile_photo ?? user.profilePhotoPath,
    id: user.id ?? user.user_id ?? user.userId,
    email: user.email ?? user.mail ?? user.userEmail,
    membershipNumber: user.membership_number ?? user.membershipNumber ?? user.membershipId,
    membershipId: user.membership_number ?? user.membershipId,
    qrCode: user.qr_code ?? user.qrCode ?? user.qrCodeData ?? user.permanentQrCode,
    verificationStatus: user.verification_status ?? user.verificationStatus,
    employmentStatus: user.employment_status ?? user.employmentStatus,
    courseName: user.course_name ?? user.courseName,
    academicLevel: user.level ?? user.academicLevel,
    homeAddress: user.home_address ?? user.homeAddress,
    currentAddress: user.current_address ?? user.currentAddress,
    studentId: user.student_id ?? user.studentId,
    admissionYear: user.admission_year ?? user.admissionYear,
    graduationYear: user.graduation_year ?? user.graduationYear,
    expectedGraduationYear: user.expected_graduation_year ?? user.expectedGraduationYear,
    biography: user.biography ?? user.bio,
    emergencyContact: user.emergency_contact ?? user.emergencyContact,
    skills: Array.isArray(user.skills) ? user.skills : user.skills ? [user.skills] : [],
  }
}

const sortPendingRegistrationsByArrival = (registrations: PendingRegistration[]) =>
  [...registrations].sort((a, b) => {
    const aTime = new Date(a.submittedDate || "").getTime() || 0
    const bTime = new Date(b.submittedDate || "").getTime() || 0
    return aTime - bTime
  })

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
  submitProfileWizard: (details: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  requestProfileUpdate: (fields: { field: string; newValue: string }[], reason: string) => void
  approveRegistration: (id: string) => Promise<void>
  rejectRegistration: (id: string, reason?: string) => Promise<void>
  clearPendingRegistrations: () => Promise<void>
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
      // Ensure students state only contains members whose membershipType indicates Student
      // snapshot.students already merges users table Students and students table entries.
      const allStudents = (snapshot.students ?? []) as Student[]
      const filteredStudents = allStudents.filter((s: any) => {
        // Accept records with explicit membership type fields or where status/membership indicates student
        const membershipType = (s.membershipType || s.membership_type || s.employmentStatus || s.employment_status || "Student")
        return String(membershipType).toLowerCase().includes("student")
      })

      setStudents(filteredStudents)
      setPendingRegistrations(sortPendingRegistrationsByArrival((snapshot.pendingRegistrations ?? []) as PendingRegistration[]))
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
            const refreshedUser = await refreshCurrentUser()
            if (refreshedUser) {
              setCurrentUser(refreshedUser)
              setCurrentRole(role)
              writeString(STORAGE_KEYS.role, role)
              persistToStorage(STORAGE_KEYS.user, refreshedUser)
            } else {
              setCurrentUser(session.user)
              setCurrentRole(role)
              writeString(STORAGE_KEYS.role, role)
              persistToStorage(STORAGE_KEYS.user, session.user)
            }
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

  const fetchCurrentUserFromApi = useCallback(async (userId: string): Promise<any | null> => {
    try {
      const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        return null
      }

      const payload = await response.json()
      const rawUser = payload?.user ?? null
      return rawUser ? normalizeApiUser(rawUser) : null
    } catch (error) {
      console.error("Failed to fetch current user from API:", error)
      return null
    }
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    try {
      const session = (await getCurrentSession()) as { user: any | null; role: string }
      const role = mapSupabaseRole(session.role)
      let nextUser: any = session.user

      if (session.user?.id) {
        const apiUser: any = await fetchCurrentUserFromApi(session.user.id)
        if (apiUser) {
          nextUser = apiUser
        }
      }

      setCurrentRole(role)
      setCurrentUser(nextUser)
      persistToStorage(STORAGE_KEYS.user, nextUser)
      writeString(STORAGE_KEYS.role, role)
      writeString(STORAGE_KEYS.sessionTimestamp, String(Date.now()))

      return nextUser
    } catch (error) {
      console.error("Failed to refresh current user session:", error)
      return null
    }
  }, [fetchCurrentUserFromApi])

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return

    const channel = supabase.channel("registry-live-sync")

    const tables = ["users", "registrations", "announcements", "events", "opportunities", "edit_requests", "universities"]
    tables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, async (payload) => {
        void refreshRegistryData()

        if (table === "users" && currentUser?.id) {
          const payloadRecord = (payload as any)?.record || (payload as any)?.new || (payload as any)?.old
          const changedUserId = payloadRecord?.id
          if (changedUserId === currentUser.id) {
            await refreshCurrentUser()
          }
        }
      })
    })

    channel.subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [currentUser?.id, refreshCurrentUser])

  const persistState = (key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], data: unknown) => {
    persistToStorage(key, data)
  }

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
      console.error("signUpWithPassword failed:", result)
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
  const submitProfileWizard = async (details: Record<string, unknown>) => {
    if (!currentUser) {
      return { success: false, error: "No authenticated user session available." }
    }

    const detailsAny = details as Record<string, any>
    const fullName = (detailsAny.fullName as string) || currentUser.fullName || currentUser.name || "Unknown Student"
    const email = (detailsAny.email as string) || currentUser.email || ""
    const phone = (detailsAny.phone as string) || currentUser.phone || ""
    const district = (detailsAny.district as string) || "Koinadugu"
    const employmentStatus = (detailsAny.employmentStatus as string) || "Student"
    const university = detailsAny.university as string | undefined
    const department = detailsAny.department as string | undefined
    const course = detailsAny.course as string | undefined
    const level = detailsAny.level as string | undefined

    try {
      const profileUpdatePayload: Record<string, unknown> = {
      fullName,
      email,
      phone,
      gender: detailsAny.gender as string | undefined,
      dob: detailsAny.dob as string | undefined,
      nationality: detailsAny.nationality as string | undefined,
      district,
      chiefdom: detailsAny.chiefdom as string | undefined,
      town: detailsAny.town as string | undefined,
      homeAddress: detailsAny.homeAddress as string | undefined,
      currentAddress: detailsAny.currentAddress as string | undefined,
      university: detailsAny.university as string | undefined,
      campus: detailsAny.campus as string | undefined,
      college: detailsAny.college as string | undefined,
      faculty: detailsAny.faculty as string | undefined,
      department: detailsAny.department as string | undefined,
      courseName: detailsAny.course as string | undefined,
      academicLevel: detailsAny.level as string | undefined,
      studentId: detailsAny.studentId as string | undefined,
      admissionYear: detailsAny.admissionYear as string | undefined,
      expectedGraduationYear: (detailsAny.expectedGradYear as string) || (detailsAny.expectedGraduationYear as string | undefined),
      graduationYear: detailsAny.graduationYear as string | undefined,
      occupation: detailsAny.occupation as string | undefined,
      organization: detailsAny.organization as string | undefined,
      biography: (detailsAny.bio as string | undefined) || (detailsAny.biography as string | undefined),
      skills: detailsAny.skills as string[] | undefined,
      emergencyContact:
        detailsAny.emergencyContact ??
        {
          name: (detailsAny.emergencyName as string | undefined),
          relationship: (detailsAny.emergencyRelation as string | undefined),
          phone: (detailsAny.emergencyPhone as string | undefined),
        },
      employmentStatus,
      status: "pending",
      profileCompletion: (detailsAny.profileCompletion as number) ?? 100,
      }

      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, profile: profileUpdatePayload }),
      })

      if (!profileResponse.ok) {
        const profileError = await profileResponse.json().catch(() => ({}))
        throw new Error(profileError.error || "Failed to save profile data before registration")
      }

      const oldProfileSnapshot = {
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        gender: currentUser.gender,
        dob: currentUser.dob,
        nationality: currentUser.nationality,
        district: currentUser.district,
        chiefdom: currentUser.chiefdom,
        town: currentUser.town,
        homeAddress: currentUser.homeAddress,
        currentAddress: currentUser.currentAddress,
        university: currentUser.university,
        campus: currentUser.campus,
        college: currentUser.college,
        faculty: currentUser.faculty,
        department: currentUser.department,
        courseName: currentUser.courseName,
        academicLevel: currentUser.academicLevel,
        studentId: currentUser.studentId,
        admissionYear: currentUser.admissionYear,
        expectedGraduationYear: currentUser.expectedGraduationYear,
        graduationYear: currentUser.graduationYear,
        occupation: currentUser.occupation,
        organization: currentUser.organization,
        biography: currentUser.biography,
        skills: currentUser.skills,
        emergencyContact: currentUser.emergencyContact,
        employmentStatus: currentUser.employmentStatus,
        status: currentUser.status,
        role: currentUser.role,
        profileCompletion: currentUser.profileCompletion,
      }

      const registration: Omit<import("@/lib/supabase/types").SupabaseRegistration, "id" | "created_at"> = {
        user_id: currentUser.id,
        full_name: fullName,
        email,
        phone,
        district,
        chiefdom: detailsAny.chiefdom as string | undefined,
        submitted_date: new Date().toISOString().split("T")[0],
        status: "pending",
        role: employmentStatus === "Student" ? "student" : "graduate",
        profile: {
          ...detailsAny,
          fullName,
          email,
          phone,
          district,
          chiefdom: detailsAny.chiefdom,
          employmentStatus,
        },
        university,
        department,
        course,
        level,
        employment_status: employmentStatus,
      }

      try {
        await createRegistration(registration)
        await refreshRegistryData()
      } catch (registrationError) {
        console.error("Registration creation failed, reverting profile update:", registrationError)
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, profile: oldProfileSnapshot }),
        }).catch((restoreError) => {
          console.error("Failed to restore user profile after registration failure:", restoreError)
        })
        throw registrationError
      }

      const pendingRegistration: PendingRegistration = {
        id: `pr_${Date.now()}`,
        fullName,
        name: fullName,
        email,
        phone,
        district,
        submittedDate: new Date().toISOString().split("T")[0],
        status: "pending",
        role: (detailsAny.employmentStatus === "Student" ? "student" : "graduate") as "student" | "graduate",
        profile: {
          ...detailsAny,
          fullName,
          email,
          phone,
          district,
          employmentStatus,
        },
        university,
        department,
        course,
        level,
        employmentStatus,
      }

      const updatedPending = [...pendingRegistrations, pendingRegistration]
      setPendingRegistrations(updatedPending)
      persistToStorage(STORAGE_KEYS.pending, updatedPending)

      const updatedUser = {
        ...currentUser,
        fullName,
        email,
        phone,
        gender: (details.gender as string | undefined) ?? currentUser.gender,
        dob: (details.dob as string | undefined) ?? currentUser.dob,
        nationality: (details.nationality as string | undefined) ?? currentUser.nationality,
        district,
        chiefdom: (details.chiefdom as string | undefined) ?? currentUser.chiefdom,
        town: (details.town as string | undefined) ?? currentUser.town,
        homeAddress: (details.homeAddress as string | undefined) ?? currentUser.homeAddress,
        currentAddress: (details.currentAddress as string | undefined) ?? currentUser.currentAddress,
        university: (details.university as string | undefined) ?? currentUser.university,
        campus: (details.campus as string | undefined) ?? currentUser.campus,
        college: (details.college as string | undefined) ?? currentUser.college,
        faculty: (details.faculty as string | undefined) ?? currentUser.faculty,
        department: (details.department as string | undefined) ?? currentUser.department,
        courseName: (details.course as string | undefined) ?? currentUser.courseName,
        academicLevel: (details.level as string | undefined) ?? currentUser.academicLevel,
        studentId: (details.studentId as string | undefined) ?? currentUser.studentId,
        admissionYear: (details.admissionYear as string | undefined) ?? currentUser.admissionYear,
        expectedGraduationYear: (details.expectedGradYear as string | undefined) || (details.expectedGraduationYear as string | undefined) || currentUser.expectedGraduationYear,
        graduationYear: (details.graduationYear as string | undefined) ?? currentUser.graduationYear,
        occupation: (details.occupation as string | undefined) ?? currentUser.occupation,
        organization: (details.organization as string | undefined) ?? currentUser.organization,
        biography: (details.bio as string | undefined) || (details.biography as string | undefined) || currentUser.biography,
        skills: (details.skills as string[] | undefined) ?? currentUser.skills,
        emergencyContact:
          details.emergencyContact ??
          currentUser.emergencyContact ??
          {
            name: (details.emergencyName as string | undefined),
            relationship: (details.emergencyRelation as string | undefined),
            phone: (details.emergencyPhone as string | undefined),
          },
        employmentStatus,
        status: "pending",
        role: "student_pending",
        profileCompletion: (details.profileCompletion as number | undefined) ?? currentUser.profileCompletion ?? 100,
      }

      setCurrentUser(updatedUser)
      persistToStorage(STORAGE_KEYS.user, updatedUser)
      setCurrentRole("student_pending")
      writeString(STORAGE_KEYS.role, "student_pending")

      await refreshCurrentUser()

      addAuditLogEntry(fullName, "completed profile setup", "Student Registry", "update")
      addNotification(
        "Application Submitted",
        "Your profile has been submitted for review. You will receive your digital identity once approved.",
        "success",
      )

      return { success: true }
    } catch (error) {
      console.error("Unable to complete registration wizard:", error)
      const message = error instanceof Error ? error.message : "Unable to submit your registration."
      addNotification(
        "Registration Error",
        message,
        "error",
      )
      return { success: false, error: message }
    }
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
        `${fields.length} field(s)`,
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

  const clearPendingRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations", {
        method: "DELETE",
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to clear pending registrations")
      }

      setPendingRegistrations([])
      persistToStorage(STORAGE_KEYS.pending, [])
      await refreshRegistryData()

      const actor = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
      addAuditLogEntry(actor, "cleared all pending registrations", "All pending requests", "delete")
      addNotification("Pending Registrations Cleared", "All pending registration requests have been deleted.", "success")
    } catch (error) {
      console.error("Failed to clear pending registrations:", error)
      addNotification(
        "Bulk Delete Failed",
        error instanceof Error ? error.message : "Unable to delete pending registrations.",
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
    const membershipType = "student"
    const isSuperAdminApproval = currentRole === "super_admin"
    const approvedRole = isSuperAdminApproval ? "executive" : "student_active_complete"
    const targetUserId = String((item as any).user_id ?? (item as any).userId ?? "")

    if (!targetUserId) {
      addNotification("Approval Failed", `Unable to approve registration for ${fullName} because the linked user account was not found.`, "error")
      return
    }

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
            role: approvedRole,
            dateApproved: new Date().toISOString().split("T")[0],
            membershipNumber: identity.membershipId,
            qrCode: identity.qrCodeData,
          },
        }),
      })

      if (!updateRes.ok) {
        const updateError = await updateRes.json().catch(() => ({}))
        console.error("Failed to update user status:", updateError)
        addNotification("Approval Failed", `Account for ${fullName} could not be activated.`, "error")
        return
      }

      const response = await fetch("/api/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          status: "approved",
          approved_by: currentUser?.id,
          reviewed_date: new Date().toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        const regError = await response.json().catch(() => ({}))
        console.error("Failed to persist approved registration:", regError)
        addNotification("Approval Failed", `Could not update registration status for ${fullName}.`, "error")
        return
      }

      const updatedPending = pendingRegistrations.filter(p => p.id !== id)
      setPendingRegistrations(updatedPending)
      persistToStorage(STORAGE_KEYS.pending, updatedPending)

      await refreshRegistryData()

      const execName = currentUser ? (currentUser.name || currentUser.fullName) : "Executive"
      addAuditLogEntry(execName, "approved registration", fullName, "approve")
      addNotification(
        "Registration Approved",
        `Account for ${fullName} has been approved. Membership ID: ${identity.membershipId}.`,
        "success"
      )
    } catch (error) {
      console.error("approveRegistration error:", error)
      addNotification("Approval Error", `An unexpected error occurred while approving ${fullName}.`, "error")
    }
  }

  const rejectRegistration = async (id: string, reason?: string) => {
    const item = pendingRegistrations.find(p => p.id === id)
    if (!item) return

    const response = await fetch("/api/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        status: "rejected",
        reviewed_date: new Date().toISOString().split("T")[0],
        rejection_reason: reason || "Rejected by admin",
      }),
    })

    if (!response.ok) {
      const rejError = await response.json().catch(() => ({}))
      console.error("Failed to persist rejected registration:", rejError)
      addNotification("Rejection Failed", `Could not update registration status for ${item.fullName || item.name}.`, "error")
      return
    }

    const updatedPending = pendingRegistrations.filter(p => p.id !== id)
    setPendingRegistrations(updatedPending)
    persistToStorage(STORAGE_KEYS.pending, updatedPending)
    await refreshRegistryData()

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
        clearPendingRegistrations,
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
