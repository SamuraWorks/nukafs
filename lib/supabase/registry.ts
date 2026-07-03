import { ensureSupabaseClient } from "@/lib/supabase/client"
import type { SupabaseFetchResult, SupabaseRegistration } from "@/lib/supabase/types"
import type { PendingRegistration } from "@/lib/types/registry"

const DEFAULT_PAGE_SIZE = 25

function normalizeRegistrationData(registration: SupabaseRegistration): PendingRegistration {
  return {
    id: registration.id,
    userId: registration.user_id,
    fullName: registration.full_name,
    email: registration.email,
    phone: registration.phone,
    district: registration.district ?? "",
    submittedDate: registration.submitted_date ?? registration.created_at ?? "",
    status: (registration.status ?? "pending") as "pending" | "approved" | "rejected",
    approvedBy: registration.approved_by,
    reviewedDate: registration.reviewed_date,
    rejectionReason: registration.rejection_reason,
    role: registration.role as any,
    profile: registration.profile as Record<string, unknown> | undefined,
    university: registration.university,
    department: registration.department,
    course: registration.course,
    level: registration.level,
    employmentStatus: registration.employment_status,
  }
}

function normalizeError(error: Error | null): string | undefined {
  return error?.message
}

export async function fetchStudents(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const supabaseClient = ensureSupabaseClient()
  const { data, error, count } = await supabaseClient
    .from("students")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch students")
  }

  return {
    data: data ?? [],
    total: count ?? 0,
  } as SupabaseFetchResult<any>
}

export async function fetchStudentById(id: string) {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient
    .from("students")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch student")
  }

  return data
}

export async function fetchAnnouncements() {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch announcements")
  }

  return data ?? []
}

export async function fetchEvents() {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch events")
  }

  return data ?? []
}

export async function fetchOpportunities() {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient
    .from("opportunities")
    .select("*")
    .order("deadline", { ascending: true })

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch opportunities")
  }

  return data ?? []
}

export async function fetchUniversities() {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient
    .from("universities")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch universities")
  }

  return data ?? []
}

export async function fetchPendingRegistrations() {
  const response = await fetch("/api/registrations", {
    cache: "no-store",
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Failed to fetch registrations")
  }

  return (result.data ?? []).map((registration: SupabaseRegistration) => normalizeRegistrationData(registration))
}

export async function createRegistration(registration: Omit<SupabaseRegistration, "id" | "created_at">) {
  const response = await fetch("/api/registrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registration),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Failed to create registration")
  }

  return result.data
}

export async function fetchEditRequests() {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient
    .from("edit_requests")
    .select("*")
    .order("submitted_date", { ascending: false })

  if (error) {
    throw new Error(normalizeError(error) ?? "Failed to fetch edit requests")
  }

  return data ?? []
}

export async function fetchRegistrySnapshot() {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/registry-snapshot", { cache: "no-store" })
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message ?? "Failed to fetch registry snapshot")
    }

    return result.data
  }

  const supabaseClient = ensureSupabaseClient()

  const [students, pendingRegistrations, editRequests, announcements, events, opportunities, universities] = await Promise.all([
    fetchStudents(1, 200).then((result) => result.data).catch(() => []),
    fetchPendingRegistrations().catch(() => []),
    fetchEditRequests().catch(() => []),
    fetchAnnouncements().catch(() => []),
    fetchEvents().catch(() => []),
    fetchOpportunities().catch(() => []),
    fetchUniversities().catch(() => []),
  ])

  // Also include any users in the `users` table who are Students but may not be present in the
  // legacy `students` table (e.g. Super Admin or admin accounts that are also Current Students).
  // We fetch recent student users and merge them into the students snapshot by unique id.
  let migratedUsers: any[] = []
  try {
    // Use case-insensitive matching for membership_type and employment_status to be robust
    const { data: userRows, error: userErr } = await supabaseClient
      .from("users")
      .select("*")
      .or("membership_type.ilike.%student%,employment_status.ilike.%student%")

    if (!userErr && Array.isArray(userRows)) {
      migratedUsers = userRows
    }
  } catch (err) {
    // ignore fetch errors and proceed with existing students
  }

  // Merge students from both sources, prefer `students` entries, but include migrated users
  const studentsById = new Map<string, any>()
  ;(students || []).forEach((s: any) => {
    if (s?.id) studentsById.set(String(s.id), s)
    else if (s?.user_id) studentsById.set(String(s.user_id), s)
  })

  ;(migratedUsers || []).forEach((u: any) => {
    const id = String(u.id)
    if (!studentsById.has(id)) {
      // Normalize basic shape to match Student type expectations
      const normalized = {
        id: u.id,
        fullName: u.full_name || u.fullName || u.name,
        membershipType: u.membership_type || u.membershipType || u.employment_status || u.employmentStatus || "Student",
        membershipNumber: u.membership_number || u.membershipNumber || null,
        membershipId: u.membership_id || u.membershipId || null,
        qrCode: u.qr_code || u.permanent_qr_code || u.qrCode,
        university: u.university,
        department: u.department,
        course: u.course || u.courseName,
        level: u.level,
        status: u.membership_status || u.status || "active",
        phone: u.phone,
        email: u.email,
        district: u.district,
        chiefdom: u.chiefdom,
        avatarColor: u.avatar_color || u.avatarColor,
        joinedDate: u.joined_date || u.created_at,
        dateIssued: u.date_issued || u.dateIssued,
        qrCodeStatus: u.qr_code_status || u.qrCodeStatus,
      }
      studentsById.set(id, normalized)
    }
  })

  const mergedStudents = Array.from(studentsById.values())

  // If nothing was merged (e.g., legacy students table empty), fall back to a looser users-only search
  if (mergedStudents.length === 0) {
    try {
      const { data: fallbackUsers, error: fbErr } = await supabaseClient
        .from("users")
        .select("*")
        .or("membership_type.ilike.%student%,employment_status.ilike.%student%")

      if (!fbErr && Array.isArray(fallbackUsers)) {
        fallbackUsers.forEach((u: any) => {
          const id = String(u.id)
          if (!studentsById.has(id)) {
            const normalized = {
              id: u.id,
              fullName: u.full_name || u.fullName || u.name,
              membershipType: u.membership_type || u.membershipType || u.employment_status || u.employmentStatus || "Student",
              membershipNumber: u.membership_number || u.membershipNumber || null,
              membershipId: u.membership_id || u.membershipId || null,
              qrCode: u.qr_code || u.permanent_qr_code || u.qrCode,
              university: u.university,
              department: u.department,
              course: u.course || u.courseName,
              level: u.level,
              status: u.membership_status || u.status || "active",
              phone: u.phone,
              email: u.email,
              district: u.district,
              chiefdom: u.chiefdom,
              avatarColor: u.avatar_color || u.avatarColor,
              joinedDate: u.joined_date || u.created_at,
              dateIssued: u.date_issued || u.dateIssued,
              qrCodeStatus: u.qr_code_status || u.qrCodeStatus,
            }
            studentsById.set(id, normalized)
          }
        })
      }
    } catch (err) {
      // ignore
    }
  }

  return {
    students: mergedStudents,
    pendingRegistrations,
    editRequests,
    announcements,
    events,
    opportunities,
    universities,
  }
}

export async function fetchStudentByIdentifier(identifier: string) {
  const supabaseClient = ensureSupabaseClient()
  const normalized = identifier.trim()

  const membershipLookup = await supabaseClient
    .from("users")
    .select("*")
    .eq("membership_number", normalized)
    .maybeSingle()

  if (membershipLookup.error) {
    throw new Error(normalizeError(membershipLookup.error) ?? "Failed to verify student identity from users")
  }

  if (membershipLookup.data) {
    return membershipLookup.data
  }

  const qrLookup = await supabaseClient
    .from("users")
    .select("*")
    .eq("qr_code", normalized)
    .maybeSingle()

  if (qrLookup.error) {
    throw new Error(normalizeError(qrLookup.error) ?? "Failed to verify student identity from users")
  }

  if (qrLookup.data) {
    return qrLookup.data
  }

  const identityLookup = await supabaseClient
    .from("membership_identities")
    .select("user_id")
    .eq("membership_id", normalized)
    .maybeSingle()

  if (identityLookup.error) {
    throw new Error(normalizeError(identityLookup.error) ?? "Failed to verify student identity from membership_identities")
  }

  if (identityLookup.data?.user_id) {
    const profileLookup = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", identityLookup.data.user_id)
      .maybeSingle()

    if (profileLookup.error) {
      throw new Error(normalizeError(profileLookup.error) ?? "Failed to load verified profile")
    }

    if (profileLookup.data) {
      return profileLookup.data
    }
  }

  const verificationLookup = await supabaseClient
    .from("membership_identities")
    .select("user_id")
    .or(`verification_url.eq.${normalized},verification_token.eq.${normalized},qr_code_data.eq.${normalized}`)
    .limit(1)

  if (verificationLookup.error) {
    throw new Error(normalizeError(verificationLookup.error) ?? "Failed to verify student identity from membership_identities")
  }

  if (verificationLookup.data?.[0]?.user_id) {
    const profileLookup = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", verificationLookup.data[0].user_id)
      .maybeSingle()

    if (profileLookup.error) {
      throw new Error(normalizeError(profileLookup.error) ?? "Failed to load verified profile")
    }

    if (profileLookup.data) {
      return profileLookup.data
    }
  }

  return null
}
