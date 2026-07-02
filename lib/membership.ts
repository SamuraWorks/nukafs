import type { MembershipIdentityStatus, MembershipStatus, Student } from "@/lib/mock-data"

export type MemberRole =
  | "Student"
  | "Executive"
  | "Administrator"
  | "Stakeholder"
  | "Super Admin"

export type MembershipType = "Student" | "Graduate/Alumnus"
  | "Stakeholder"

export interface VerifiedMemberProfile {
  fullName: string
  membershipNumber: string
  membershipId: string
  qrCodeValue: string
  membershipStatus: MembershipStatus
  qrCodeStatus: MembershipIdentityStatus
  membershipType: MembershipType
  university: string
  faculty: string
  department: string
  course: string
  academicLevel: string
  district: string
  dateRegistered: string
  dateApproved: string
  dateIssued: string
  currentRole: MemberRole
  avatarColor: string
  cardSerialNumber: string
  isMigratedToDigitalRegistry: boolean
  legacyMembershipHistory: string
  profilePhotoUrl?: string
}

const FACULTY_BY_DEPARTMENT: Record<string, string> = {
  "Science & Technology": "Faculty of Science & Technology",
  "Health Sciences": "Faculty of Health Sciences",
  "Social Sciences": "Faculty of Social Sciences",
  Engineering: "Faculty of Engineering",
  "Arts & Humanities": "Faculty of Arts & Humanities",
  "Business & Management": "Faculty of Business & Management",
  Agriculture: "Faculty of Agriculture",
}

function deriveFaculty(department: string): string {
  return FACULTY_BY_DEPARTMENT[department] ?? "Faculty of General Studies"
}

function deriveMembershipType(student: Student): MembershipType {
  return student.employmentStatus === "Student" ? "Student" : "Graduate/Alumnus"
}

function pickValue<T>(source: Record<string, any> | undefined, keys: string[], fallback?: T): T | undefined {
  if (!source) return fallback

  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== "") {
      return value as T
    }
  }

  return fallback
}

function deriveCardSerial(membershipNumber: string): string {
  const match = membershipNumber.match(/NUKaFs-(\d{4})-(\d+)/i)
  if (match) {
    const yearShort = match[1].slice(-2)
    return `NUKaFs${yearShort}-${match[2]}`
  }
  const digits = membershipNumber.replace(/\D/g, "")
  const suffix = digits.slice(-6).padStart(6, "0")
  return `NUKaFs26-${suffix}`
}

function deriveApprovalDate(joinedDate: string): string {
  const date = new Date(joinedDate)
  if (Number.isNaN(date.getTime())) return joinedDate
  date.setDate(date.getDate() + 1)
  return date.toISOString().split("T")[0]
}

function formatMembershipId(sequence: number): string {
  return `NUKaFs-${String(sequence).padStart(6, "0")}`
}

function formatQrCode(sequence: number): string {
  return `NUKaFs-QR-${String(sequence).padStart(6, "0")}`
}

export function createMembershipIdentity(
  existingMembers: Array<{ membershipId?: string; qrCode?: string }>,
  fallbackIndex?: number,
) {
  let nextSequence = fallbackIndex ?? existingMembers.length + 1
  const usedIds = new Set(
    existingMembers
      .map((member) => member.membershipId)
      .filter((value): value is string => Boolean(value)),
  )

  while (usedIds.has(formatMembershipId(nextSequence))) {
    nextSequence += 1
  }

  return {
    membershipId: formatMembershipId(nextSequence),
    qrCodeValue: formatQrCode(nextSequence),
    qrCodeStatus: "active" as MembershipIdentityStatus,
    dateIssued: new Date().toISOString().split("T")[0],
  }
}

export function memberToVerifiedProfile(user: any, role?: string): VerifiedMemberProfile {
  const fullName = pickValue<string>(user, ["fullName", "full_name", "name"], "NUKaFs Member") ?? "NUKaFs Member"
  const membershipNumber =
    pickValue<string>(user, ["membershipNumber", "membership_number", "staffId", "memberId", "membershipId", "id"], `NUKaFs-LEGACY-${String(user?.id || Math.floor(Math.random() * 1000000)).padStart(6, "0")}`) ?? `NUKaFs-LEGACY-${String(user?.id || Math.floor(Math.random() * 1000000)).padStart(6, "0")}`
  const membershipId =
    pickValue<string>(user, ["membershipId", "membership_id", "membershipNumber", "membership_number"], undefined) ||
    (typeof membershipNumber === "string"
      ? `NUKaFs-${String(membershipNumber.replace(/\D/g, "")).slice(-6).padStart(6, "0")}`
      : `NUKaFs-${String(Date.now()).slice(-6)}`)
  const qrCodeValue = (() => {
    const stored = pickValue<string>(user, ["qrCode", "qr_code", "qrCodeValue"], undefined)
    // If the stored value is already a full verification URL (from the new production system), use it directly
    if (stored && /^https?:\/\//i.test(stored)) return stored
    // Otherwise build a QR value from the membership ID
    return stored || `NUKaFs-QR-${String(membershipId.replace(/\D/g, "")).slice(-6).padStart(6, "0")}`
  })()
  const profilePhotoUrl = pickValue<string>(user, ["profilePhotoUrl", "profile_photo_url", "profilePhoto", "profile_photo"], undefined)
  const dateIssued = pickValue<string>(user, ["dateIssued", "joinedDate", "createdAt", "date_issued"], new Date().toISOString().split("T")[0]) ?? new Date().toISOString().split("T")[0]
  const status = (pickValue<MembershipStatus>(user, ["status", "membershipStatus", "membership_status"], "active") ?? "active") as MembershipStatus
  const membershipType: MembershipType =
    role === "stakeholder" || pickValue<string>(user, ["role", "userRole"], undefined) === "stakeholder"
      ? "Stakeholder"
      : pickValue<string>(user, ["employmentStatus", "employment_status"], undefined) === "Student"
      ? "Student"
      : "Graduate/Alumnus"
  const currentRole: MemberRole =
    role === "executive"
      ? "Executive"
      : role === "stakeholder"
      ? "Stakeholder"
      : role === "super_admin"
      ? "Super Admin"
      : "Student"
  const department = pickValue<string>(user, ["department", "title", "program"], "Registry Operations") ?? "Registry Operations"
  const university = pickValue<string>(user, ["university", "organization", "institution"], "NUKaFs Secretariat") ?? "NUKaFs Secretariat"
  const faculty = pickValue<string>(user, ["faculty", "faculties"], undefined) ?? deriveFaculty(department)

  return {
    fullName,
    membershipNumber,
    membershipId,
    qrCodeValue,
    membershipStatus: status,
    qrCodeStatus: (pickValue<MembershipIdentityStatus>(user, ["qrCodeStatus", "qr_code_status"], "active") ?? "active") as MembershipIdentityStatus,
    membershipType,
    university,
    faculty,
    department,
    course: pickValue<string>(user, ["course", "position", "program_of_study"], "Membership") ?? "Membership",
    academicLevel: pickValue<string>(user, ["level", "academicLevel", "academic_level"], "N/A") ?? "N/A",
    district: pickValue<string>(user, ["district", "location"], "Koinadugu & Falaba") ?? "Koinadugu & Falaba",
    dateRegistered: pickValue<string>(user, ["joinedDate", "createdAt", "dateRegistered", "date_registered"], dateIssued) ?? dateIssued,
    dateApproved: pickValue<string>(user, ["dateApproved", "date_approved"], dateIssued) ?? dateIssued,
    dateIssued,
    currentRole,
    avatarColor: pickValue<string>(user, ["avatarColor", "avatar_color"], "oklch(0.45 0.12 158)") ?? "oklch(0.45 0.12 158)",
    cardSerialNumber: deriveCardSerial(membershipNumber),
    isMigratedToDigitalRegistry: pickValue<boolean>(user, ["isMigratedToDigitalRegistry", "is_migrated_to_digital_registry"], false) ?? false,
    legacyMembershipHistory: pickValue<string>(user, ["legacyMembershipHistory", "legacy_membership_history"], "Registered in the digital registry") ?? "Registered in the digital registry",
    profilePhotoUrl,
  }
}

export function studentToVerifiedProfile(student: Student): VerifiedMemberProfile {
  const membershipId = student.membershipId ?? `NUKaFs-${String((Number(student.membershipNumber.replace(/\D/g, "")) % 1000000) || 1).padStart(6, "0")}`
  const qrCodeValue = student.qrCode ?? `NUKaFs-QR-${membershipId.replace("NUKaFs-", "")}`
  const dateIssued = student.dateIssued ?? deriveApprovalDate(student.joinedDate)
  const primaryStatus = student.qrCodeStatus === "revoked" || student.qrCodeStatus === "expired" ? "revoked" : student.status

  return {
    fullName: student.fullName,
    membershipNumber: student.membershipNumber,
    membershipId,
    qrCodeValue,
    membershipStatus: primaryStatus === "revoked" ? "revoked" : student.status,
    qrCodeStatus: student.qrCodeStatus ?? "active",
    membershipType: deriveMembershipType(student),
    university: student.university,
    faculty: deriveFaculty(student.department),
    department: student.department,
    course: student.course,
    academicLevel: student.level,
    district: student.district,
    dateRegistered: student.joinedDate,
    dateApproved: deriveApprovalDate(student.joinedDate),
    dateIssued,
    currentRole: "Student",
    avatarColor: student.avatarColor,
    cardSerialNumber: deriveCardSerial(student.membershipNumber),
    isMigratedToDigitalRegistry: student.isMigratedToDigitalRegistry ?? false,
    legacyMembershipHistory: student.legacyMembershipHistory ?? "Registered in the digital registry",
    profilePhotoUrl: (student as any).profilePhotoUrl || (student as any).profilePhoto,
  }
}

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toUpperCase()
}


export function formatMembershipDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getVerifyUrl(membershipNumber: string, origin?: string): string {
  const value = membershipNumber?.trim() ?? ""

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  const base =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://registry.nukafs-sl.org")

  return `${base}/verify/${value}`
}

export const NUKaFs_CONTACT = {
  website: "www.nukafs-sl.org",
  email: "registry@nukafs-sl.org",
  phone: "+232 76 000 000",
} as const
