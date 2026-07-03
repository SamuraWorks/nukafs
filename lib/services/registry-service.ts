import { readStorage } from "@/lib/storage/persistence"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import { fetchStudentByIdentifier } from "@/lib/supabase/registry"
import { extractVerificationToken } from "@/lib/membership-id-system"
import { memberToVerifiedProfile, type VerifiedMemberProfile } from "@/lib/membership"
import type { Student } from "@/lib/types/registry"

function countBy<T>(items: readonly T[], keyFn: (item: T) => string | undefined) {
  return items.reduce<Record<string, number>>((result, item) => {
    const key = keyFn(item)
    if (!key) return result
    result[key] = (result[key] ?? 0) + 1
    return result
  }, {})
}

function toChartData(counts: Record<string, number>) {
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function formatMonthKey(value?: string): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`
}

function buildTrendData(students: Student[]) {
  const counts: Record<string, number> = {}
  students.forEach((student) => {
    const key = formatMonthKey(student.joinedDate ?? student.joined_date)
    if (!key) return
    counts[key] = (counts[key] ?? 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, members: value }))
}

export const registryService = {
  getStudents() {
    return readStorage(STORAGE_KEYS.students, [])
  },

  getAnnouncements() {
    return readStorage(STORAGE_KEYS.announcements, [])
  },

  getEvents() {
    return readStorage(STORAGE_KEYS.events, [])
  },

  getOpportunities() {
    return readStorage(STORAGE_KEYS.opportunities, [])
  },

  getPendingRegistrations() {
    return readStorage(STORAGE_KEYS.pending, [])
  },

  getEditRequests() {
    return readStorage(STORAGE_KEYS.editRequests, [])
  },

  getTeamMembers() {
    return readStorage(STORAGE_KEYS.teamMembers, [])
  },

  getAuditLog() {
    return readStorage(STORAGE_KEYS.auditLog, [])
  },

  getUniversities() {
    return readStorage(STORAGE_KEYS.universities, [])
  },
}

export const memberService = {
  async verifyMembership(identifier: string): Promise<VerifiedMemberProfile | null> {
    try {
      const normalizedIdentifier = identifier.trim()
      const token = extractVerificationToken(normalizedIdentifier) ?? (normalizedIdentifier.match(/^[a-f0-9]{64}$/i) ? normalizedIdentifier : null)

      let lookupIdentifier = normalizedIdentifier

      if (token) {
        const response = await fetch(`/api/membership-id?action=verify-token&token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          return null
        }

        const payload = await response.json()
        if (!payload?.valid || !payload?.membershipId) {
          return null
        }

        lookupIdentifier = payload.membershipId
      }

      const student = await fetchStudentByIdentifier(lookupIdentifier)
      if (!student) {
        return null
      }

      const status = String(student.status ?? student.membership_status ?? "").toLowerCase()
      const verificationStatus = String(student.verification_status ?? "").toLowerCase()
      const qrStatus = String(student.qr_code_status ?? student.qrCodeStatus ?? "active").toLowerCase()

      if (status !== "active" || verificationStatus !== "verified" || qrStatus === "revoked" || qrStatus === "expired") {
        return null
      }

      const profile = memberToVerifiedProfile(student as any, (student as any)?.role)
      if (profile.membershipStatus !== "active") {
        return null
      }

      return profile
    } catch (error) {
      console.error("Membership verification failed:", error)
      return null
    }
  },
}

export const analyticsService = {
  getSummary(students: Student[]) {
    const distribution = countBy(students, (student) => String(student.status ?? student.membership_status ?? "").toLowerCase())
    return {
      total: students.length,
      active: distribution.active ?? 0,
      pending: distribution.pending ?? 0,
      suspended: distribution.suspended ?? 0,
      expired: distribution.expired ?? 0,
    }
  },

  getMembersByUniversity(students: Student[]) {
    return toChartData(countBy(students, (student) => student.university?.trim() || "Unknown"))
  },

  getMembersByCourse(students: Student[]) {
    return toChartData(countBy(students, (student) => student.course?.trim() || "Unknown"))
  },

  getMembersByDepartment(students: Student[]) {
    return toChartData(countBy(students, (student) => student.department?.trim() || "Unknown"))
  },

  getMembersByLevel(students: Student[]) {
    return toChartData(countBy(students, (student) => student.level?.trim() || "Unknown"))
  },

  getMembersByGender(students: Student[]) {
    return toChartData(countBy(students, (student) => student.gender?.trim() || "Unknown"))
  },

  getMembersByDistrict(students: Student[]) {
    return toChartData(countBy(students, (student) => student.district?.trim() || "Unknown"))
  },

  getMembersByChiefdom(students: Student[]) {
    return toChartData(countBy(students, (student) => student.chiefdom?.trim() || "Unknown"))
  },

  getRegistrationTrend(students: Student[]) {
    return buildTrendData(students)
  },

  getEmploymentStats(students: Student[]) {
    return toChartData(countBy(students, (student) => student.employmentStatus?.trim() || "Unknown"))
  },

  getTopSkills(students: Student[]) {
    const counts: Record<string, number> = {}
    students.forEach((student) => {
      const skills = Array.isArray(student.skills) ? student.skills : []
      skills.forEach((skill) => {
        const name = String(skill).trim()
        if (!name) return
        counts[name] = (counts[name] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  },

  getScholarshipRequests(students: Student[]) {
    const requested = students.filter((student) => Boolean(student.scholarshipApplicant ?? student.scholarship_applicant)).length
    return [
      { name: "Requested", value: requested },
      { name: "Not Requested", value: Math.max(0, students.length - requested) },
    ]
  },

  getMembershipBreakdown(students: Student[]) {
    return {
      total: students.length,
      active: students.filter((s) => String(s.status ?? s.membership_status).toLowerCase() === "active").length,
      pending: students.filter((s) => String(s.status ?? s.membership_status).toLowerCase() === "pending").length,
      suspended: students.filter((s) => String(s.status ?? s.membership_status).toLowerCase() === "suspended").length,
      expired: students.filter((s) => String(s.status ?? s.membership_status).toLowerCase() === "expired").length,
    }
  },
}
