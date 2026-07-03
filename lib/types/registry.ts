export type MembershipStatus =
  | "active"
  | "pending"
  | "expired"
  | "suspended"
  | "inactive"
  | "revoked"

export type MembershipIdentityStatus = "active" | "revoked" | "expired" | "inactive"
export type RequestStatus = "pending" | "approved" | "rejected"
export type Role = "student" | "executive" | "stakeholder" | "super_admin"

export interface Student {
  id?: string
  membershipNumber?: string
  fullName?: string
  full_name?: string
  name?: string
  email?: string
  phone?: string
  gender?: "Male" | "Female" | string
  district?: string
  chiefdom?: string
  university?: string
  course?: string
  department?: string
  level?: string
  status?: MembershipStatus
  profileCompletion?: number
  joinedDate?: string
  joined_date?: string
  avatarColor?: string
  profilePhoto?: string
  profile_photo?: string
  employmentStatus?: string
  employment_status?: string
  skills?: string[]
  scholarshipApplicant?: boolean
  membershipId?: string
  membership_id?: string
  qrCode?: string
  qr_code?: string
  qrCodeStatus?: MembershipIdentityStatus
  qr_code_status?: MembershipIdentityStatus
  dateIssued?: string
  date_issued?: string
  isMigratedToDigitalRegistry?: boolean
  is_migrated_to_digital_registry?: boolean
  legacyMembershipHistory?: string
  legacy_membership_history?: string
  dateApproved?: string
  date_approved?: string
  role?: string
  created_at?: string
  updated_at?: string
  profilePhotoUrl?: string
  profile_photo_url?: string
  homeAddress?: string
  currentAddress?: string
  studentId?: string
  admissionYear?: string
  graduationYear?: string
  expectedGraduationYear?: string
  occupation?: string
  organization?: string
  biography?: string
  emergencyContact?: any
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
  description: string
  type: string
  deadline: string
  status: string
}

export interface NUKaFsEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  status: string
  attendees: number
}

export interface EditRequest {
  id: string
  membershipNumber: string
  studentName: string
  field: string
  newValue: string
  status: RequestStatus
  submittedDate: string
  reviewedDate?: string
  comment?: string
}

export interface PendingRegistration {
  id: string
  userId?: string
  fullName: string
  name?: string
  email: string
  phone: string
  district?: string
  submittedDate?: string
  status: RequestStatus
  approvedBy?: string
  reviewedDate?: string
  rejectionReason?: string
  role?: string
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
  role: string
  status: "active" | "invited" | "inactive"
}

export interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  type: string
}
