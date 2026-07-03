export type MembershipStatus = "active" | "pending" | "expired" | "suspended" | "inactive" | "revoked"
export type MembershipIdentityStatus = "active" | "revoked" | "expired" | "inactive"
export type RequestStatus = "pending" | "approved" | "rejected"
export type Role = "student" | "executive" | "stakeholder" | "super_admin"

export interface Student {
  id: string
  membershipNumber: string
  fullName: string
  email: string
  phone: string
  gender: "Male" | "Female"
  district: string
  chiefdom: string
  university: string
  course: string
  department: string
  level: string
  status: MembershipStatus
  profileCompletion: number
  joinedDate: string
  avatarColor: string
  profilePhoto?: string
  employmentStatus: "Employed" | "Unemployed" | "Self-employed" | "Student"
  skills: string[]
  scholarshipApplicant: boolean
  membershipId?: string
  qrCode?: string
  qrCodeStatus?: MembershipIdentityStatus
  dateIssued?: string
  isMigratedToDigitalRegistry?: boolean
  legacyMembershipHistory?: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  category: "General" | "Academic" | "Event" | "Urgent" | "Opportunity"
  author: string
  date: string
  pinned?: boolean
}

export interface Opportunity {
  id: string
  title: string
  organization: string
  type: "Scholarship" | "Internship" | "Job" | "Leadership"
  location: string
  deadline: string
  amount?: string
  tags: string[]
  description: string
  applications?: number
  views?: number
  eligibleMembers?: number
  status?: "Open" | "Closed" | "Archived"
}

export interface NUKaFsEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  status: "upcoming" | "past"
  attendees: number
}

export interface EditRequest {
  id: string
  studentName: string
  membershipNumber: string
  field: string
  oldValue: string
  newValue: string
  status: RequestStatus
  submittedDate: string
  reviewedDate?: string
  reason: string
}

export interface PendingRegistration {
  id: string
  userId?: string
  name?: string
  fullName: string
  email: string
  phone: string
  district: string
  submittedDate: string
  status?: "pending" | "approved" | "rejected"
  role?: "student" | "graduate" | "stakeholder"
  approvedBy?: string
  reviewedDate?: string
  rejectionReason?: string
  profile?: Record<string, unknown>
  university?: string
  department?: string
  course?: string
  level?: string
  employmentStatus?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  title: string
  status: "active" | "invited" | "disabled"
  lastActive: string
}

export interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  type: "create" | "update" | "delete" | "approve" | "login"
}
