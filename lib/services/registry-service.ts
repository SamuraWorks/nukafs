import { readStorage } from "@/lib/storage/persistence"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import { fetchStudentByIdentifier } from "@/lib/supabase/registry"
import { memberToVerifiedProfile, type VerifiedMemberProfile } from "@/lib/membership"
import { stats, membersByUniversity, membersByCourse, membersByDepartment, membersByLevel, membersByGender, membersByDistrict, membersByChiefdom, registrationTrend, employmentStats, topSkills, scholarshipRequests } from "@/lib/mock-data"
import type { Student } from "@/lib/mock-data"

/** Data-access layer — production-ready Supabase-backed registry helper */

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
      const student = await fetchStudentByIdentifier(identifier)
      if (!student) {
        return null
      }

      const profile = memberToVerifiedProfile(student as any, (student as any)?.role)
      if (profile.qrCodeStatus === "revoked" || profile.qrCodeStatus === "expired") {
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
  getSummary() {
    return stats
  },

  getMembersByUniversity() {
    return membersByUniversity
  },

  getMembersByCourse() {
    return membersByCourse
  },

  getMembersByDepartment() {
    return membersByDepartment
  },

  getMembersByLevel() {
    return membersByLevel
  },

  getMembersByGender() {
    return membersByGender
  },

  getMembersByDistrict() {
    return membersByDistrict
  },

  getMembersByChiefdom() {
    return membersByChiefdom
  },

  getRegistrationTrend() {
    return registrationTrend
  },

  getEmploymentStats() {
    return employmentStats
  },

  getTopSkills() {
    return topSkills
  },

  getScholarshipRequests() {
    return scholarshipRequests
  },

  getMembershipBreakdown(students: Student[]) {
    return {
      total: students.length,
      active: students.filter((s) => s.status === "active").length,
      pending: students.filter((s) => s.status === "pending").length,
      suspended: students.filter((s) => s.status === "suspended").length,
      expired: students.filter((s) => s.status === "expired").length,
    }
  },
}
