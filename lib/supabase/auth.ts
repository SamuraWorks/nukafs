import { ensureSupabaseClient } from "@/lib/supabase/client"
import type { SupabaseUserProfile } from "@/lib/supabase/types"

export interface AuthResult {
  success: boolean
  user?: any
  role?: string
  message?: string
  requiresPasswordChange?: boolean
}

export interface PasswordChangeResult {
  success: boolean
  message?: string
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }
  if (typeof value === "number") {
    return String(value)
  }
  return undefined
}

function normalizeArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
  }
  return undefined
}

function normalizeBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined
}

function normalizeNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined
}

function mapRoleLabel(role?: string): string | undefined {
  switch (role) {
    case "student_pending":
      return "Student"
    case "student_active_wizard":
      return "Student"
    case "student":
    case "student_active_complete":
      return "Student"
    case "executive":
    case "admin":
    case "administrator":
      return "Executive"
    case "stakeholder":
      return "Stakeholder"
    case "super_admin":
      return "Super Admin"
    default:
      return role ? role.replace(/_/g, " ") : undefined
  }
}

export function mapUserMetadataToRole(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "guest"
  const role = metadata.role as string | undefined
  switch (role) {
    case "student_pending":
      return "student_pending"
    case "student_active_wizard":
      return "student_active_wizard"
    case "student":
    case "student_active_complete":
      return "student_active_complete"
    case "executive":
    case "admin":
    case "administrator":
      return "executive"
    case "stakeholder":
      return "stakeholder"
    case "super_admin":
      return "super_admin"
    default:
      return "guest"
  }
}

function buildAuthenticatedUser(
  authUser: {
    id: string
    email?: string | null
    phone?: string | null
    user_metadata?: Record<string, unknown> | null
    app_metadata?: Record<string, unknown> | null
  },
  profileRow?: Record<string, unknown> | null,
): any {
  const metadata = {
    ...(authUser.user_metadata ?? {}),
    ...(authUser.app_metadata ?? {}),
  } as Record<string, unknown>
  const profileData = (profileRow ?? null) as Record<string, unknown> | null
  const fullName = normalizeString(
    profileData?.full_name ?? profileData?.fullName ?? metadata?.full_name ?? metadata?.fullName,
  )
  const role = normalizeString(profileData?.role ?? metadata?.role) ?? "student_pending"
  const status = normalizeString(profileData?.status ?? metadata?.status) ?? "pending"
  const profileCompletion = normalizeNumber(profileData?.profile_completion ?? metadata?.profile_completion) ?? 100
  const profilePhotoUrl = normalizeString(profileData?.profile_photo_url)
  const profilePhotoPath = normalizeString(profileData?.profile_photo)

  return {
    id: authUser.id,
    email: normalizeString(profileData?.email ?? authUser.email) ?? "",
    phone: normalizeString(profileData?.phone ?? authUser.phone) ?? undefined,
    fullName,
    name: fullName,
    full_name: fullName,
    role,
    status,
    password_change_required: Boolean(
      normalizeBoolean(profileData?.password_change_required) ?? normalizeBoolean(metadata?.password_change_required) ?? false,
    ),
    profileCompletion,
    profile_completion: profileCompletion,
    membershipNumber: normalizeString(profileData?.membership_number),
    membership_number: normalizeString(profileData?.membership_number),
    membershipId: normalizeString(profileData?.membership_number),
    verificationStatus: normalizeString(profileData?.verification_status),
    membershipType: normalizeString(profileData?.membership_type),
    dateApproved: normalizeString(profileData?.date_approved ?? profileData?.date_issued ?? profileData?.joined_date),
    accountStatus: normalizeString(profileData?.account_status),
    permanentQrCode: normalizeString(profileData?.permanent_qr_code ?? profileData?.qr_code),
    university: normalizeString(profileData?.university),
    faculty: normalizeString(profileData?.faculty),
    campus: normalizeString(profileData?.campus),
    course: normalizeString(profileData?.course),
    courseName: normalizeString(profileData?.course_name ?? profileData?.course),
    department: normalizeString(profileData?.department),
    level: normalizeString(profileData?.level),
    academicLevel: normalizeString(profileData?.level),
    district: normalizeString(profileData?.district),
    chiefdom: normalizeString(profileData?.chiefdom),
    town: normalizeString(profileData?.town),
    college: normalizeString(profileData?.college),
    homeAddress: normalizeString(profileData?.home_address),
    currentAddress: normalizeString(profileData?.current_address),
    gender: normalizeString(profileData?.gender),
    dob: normalizeString(profileData?.dob),
    nationality: normalizeString(profileData?.nationality),
    studentId: normalizeString(profileData?.student_id),
    admissionYear: normalizeString(profileData?.admission_year),
    graduationYear: normalizeString(profileData?.graduation_year),
    expectedGraduationYear: normalizeString(profileData?.expected_graduation_year),
    occupation: normalizeString(profileData?.occupation),
    organization: normalizeString(profileData?.organization),
    biography: normalizeString(profileData?.biography),
    emergencyContact: normalizeString(profileData?.emergency_contact) ?? profileData?.emergency_contact,
    employmentStatus: normalizeString(profileData?.employment_status),
    employment_status: normalizeString(profileData?.employment_status),
    skills: normalizeArray(profileData?.skills) ?? normalizeArray(metadata?.skills),
    scholarshipApplicant: normalizeBoolean(profileData?.scholarship_applicant) ?? normalizeBoolean(metadata?.scholarship_applicant),
    joinedDate: normalizeString(profileData?.joined_date),
    avatarColor: normalizeString(profileData?.avatar_color),
    qrCode: normalizeString(profileData?.qr_code),
    profilePhoto: profilePhotoUrl ?? profilePhotoPath,
    profilePhotoUrl,
    profilePhotoPath,
    qrCodeStatus: normalizeString(profileData?.qr_code_status),
    dateIssued: normalizeString(profileData?.date_issued),
    isMigratedToDigitalRegistry: normalizeBoolean(profileData?.is_migrated_to_digital_registry),
    legacyMembershipHistory: normalizeString(profileData?.legacy_membership_history),
    createdAt: normalizeString(profileData?.created_at),
    updatedAt: normalizeString(profileData?.updated_at),
    roleLabel: mapRoleLabel(role),
    title: mapRoleLabel(role),
  }
}

async function loadAuthenticatedUserProfile(
  authUser: {
    id: string
    email?: string | null
    phone?: string | null
    user_metadata?: Record<string, unknown> | null
    app_metadata?: Record<string, unknown> | null
  },
): Promise<any> {
  const supabaseClient = ensureSupabaseClient()

  try {
    const { data: existingProfile, error: fetchError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.warn("Unable to hydrate profile from users table:", fetchError)
      return buildAuthenticatedUser(authUser, null)
    }

    if (existingProfile) {
      return buildAuthenticatedUser(authUser, existingProfile)
    }

    // Try to fetch via API to bypass RLS cache/policy issues in browser
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/profile?userId=${authUser.id}`)
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data.success && data.user) {
            return buildAuthenticatedUser(authUser, data.user)
          }
          if (data.user) {
            return buildAuthenticatedUser(authUser, data.user)
          }
        }
      } catch (e) {
        console.error("Fallback API fetch failed", e)
      }
    }

    const metadata = {
      ...(authUser.user_metadata ?? {}),
      ...(authUser.app_metadata ?? {}),
    } as Record<string, unknown>

    const { data: emailMatchedProfile, error: emailLookupError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("email", authUser.email ?? "")
      .order("updated_at", { ascending: false })
      .maybeSingle()

    if (!emailLookupError && emailMatchedProfile && emailMatchedProfile.id !== authUser.id) {
      const migratedProfile = {
        id: authUser.id,
        email: authUser.email ?? emailMatchedProfile.email ?? null,
        phone: authUser.phone ?? normalizeString(emailMatchedProfile.phone) ?? null,
        full_name: normalizeString(emailMatchedProfile.full_name ?? metadata?.full_name ?? metadata?.fullName) ?? null,
        role: normalizeString(emailMatchedProfile.role ?? metadata?.role) ?? "student_pending",
        status: normalizeString(emailMatchedProfile.status ?? metadata?.status) ?? "pending",
        profile_completion: normalizeNumber(emailMatchedProfile.profile_completion ?? metadata?.profile_completion) ?? 0,
        membership_number: normalizeString(emailMatchedProfile.membership_number),
        university: normalizeString(emailMatchedProfile.university),
        created_at: normalizeString(emailMatchedProfile.created_at) ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: migrateError } = await supabaseClient.from("users").upsert(migratedProfile, {
        onConflict: "id",
      })

      if (!migrateError) {
        await supabaseClient.from("users").delete().eq("id", emailMatchedProfile.id)
        const { data: migratedProfileData, error: reloadError } = await supabaseClient
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle()

        if (!reloadError && migratedProfileData) {
          return buildAuthenticatedUser(authUser, migratedProfileData)
        }
      }
    }

    const { error: upsertError } = await supabaseClient.from("users").upsert(
      {
        id: authUser.id,
        email: authUser.email ?? null,
        phone: authUser.phone ?? null,
        full_name: normalizeString(metadata?.full_name ?? metadata?.fullName) ?? null,
        role: normalizeString(metadata?.role) ?? "student_pending",
        status: normalizeString(metadata?.status) ?? "pending",
        profile_completion: normalizeNumber(metadata?.profile_completion) ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    if (upsertError) {
      console.warn("Unable to create authenticated profile record:", upsertError)
      return buildAuthenticatedUser(authUser, null)
    }

    const { data: createdProfile, error: reloadError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle()

    if (reloadError && reloadError.code !== "PGRST116") {
      console.warn("Unable to reload authenticated profile after creation:", reloadError)
      return buildAuthenticatedUser(authUser, null)
    }

    return buildAuthenticatedUser(authUser, createdProfile)
  } catch (error) {
    console.warn("Profile hydration failed:", error)
    return buildAuthenticatedUser(authUser, null)
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data?.user) {
    return {
      success: false,
      message: error?.message ?? "Unable to sign in",
    }
  }

  const metadata = {
    ...(data.user.user_metadata ?? {}),
    ...(data.user.app_metadata ?? {}),
  } as Record<string, unknown>
  const user = await loadAuthenticatedUserProfile(data.user)
  const passwordChangeRequired = Boolean(user?.password_change_required ?? (metadata as any)?.password_change_required)

  const resolvedRole = normalizeString(user?.role ?? metadata?.role)

  if (passwordChangeRequired) {
    return {
      success: false,
      user,
      role: resolvedRole ? mapUserMetadataToRole({ role: resolvedRole } as Record<string, unknown>) : mapUserMetadataToRole(metadata),
      requiresPasswordChange: true,
      message: "Password change required before access is granted.",
    }
  }

  return {
    success: true,
    user,
    role: resolvedRole ? mapUserMetadataToRole({ role: resolvedRole } as Record<string, unknown>) : mapUserMetadataToRole(metadata),
  }
}

export async function signUpWithPassword(
  fullName: string,
  email: string,
  password: string,
  phone?: string,
): Promise<AuthResult> {
  const supabaseClient = ensureSupabaseClient()
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role: "student_active_wizard",
        status: "pending",
        profile_completion: 0,
      },
    },
  })

  if (error || !data?.user) {
    return {
      success: false,
      message: error?.message ?? "Unable to register account",
    }
  }

  const user = await loadAuthenticatedUserProfile({
    id: data.user.id,
    email: data.user.email ?? email,
    phone: data.user.phone ?? phone,
    user_metadata: {
      full_name: fullName,
      phone,
      role: "student_active_wizard",
      status: "pending",
      profile_completion: 0,
    },
  })

  return {
    success: true,
    user,
    role: "student_active_wizard",
  }
}

export async function signOut(): Promise<void> {
  const supabaseClient = ensureSupabaseClient()
  await supabaseClient.auth.signOut()
}

export async function getCurrentSession(): Promise<{
  user: SupabaseUserProfile | null
  role: string
}>
{
  const supabaseClient = ensureSupabaseClient()

  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession()

  let activeSession = session

  if (error) {
    console.warn("Unable to restore auth session:", error)
  }

  if (!activeSession?.user) {
    const { data: refreshedSessionData, error: refreshError } = await supabaseClient.auth.refreshSession()

    if (!refreshError && refreshedSessionData.session?.user) {
      activeSession = refreshedSessionData.session
    }
  }

  if (!activeSession?.user) {
    return { user: null, role: "guest" }
  }

  const user = await loadAuthenticatedUserProfile(activeSession.user)
  const mergedMetadata = {
    ...((activeSession.user.user_metadata ?? {}) as Record<string, unknown>),
    ...((activeSession.user.app_metadata ?? {}) as Record<string, unknown>),
  }
  const resolvedRole =
    normalizeString(user?.role) ??
    normalizeString(mergedMetadata?.role) ??
    "student_pending"

  return {
    user,
    role: mapUserMetadataToRole({ role: resolvedRole } as Record<string, unknown>),
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<PasswordChangeResult> {
  const supabaseClient = ensureSupabaseClient()

  const {
    data: { user: authUser },
    error: userError,
  } = await supabaseClient.auth.getUser()

  if (userError || !authUser?.email) {
    return {
      success: false,
      message: userError?.message ?? "You must be signed in to change your password.",
    }
  }

  const { error: reauthError } = await supabaseClient.auth.signInWithPassword({
    email: authUser.email,
    password: currentPassword,
  })

  if (reauthError) {
    return {
      success: false,
      message: "Current password is incorrect.",
    }
  }

  const { error: updateError } = await supabaseClient.auth.updateUser({
    password: newPassword,
    data: {
      password_change_required: false,
    },
  })

  if (updateError) {
    return {
      success: false,
      message: updateError.message ?? "Password change failed.",
    }
  }

  await supabaseClient.from("users").update({
    password_change_required: false,
    updated_at: new Date().toISOString(),
  }).eq("id", authUser.id)

  const { data: refreshedSessionData, error: refreshError } = await supabaseClient.auth.refreshSession()
  if (refreshError || !refreshedSessionData.session) {
    return {
      success: false,
      message: "Password updated, but the session could not be refreshed. Please sign in again.",
    }
  }

  const { data: verificationData, error: verificationError } = await supabaseClient.auth.signInWithPassword({
    email: authUser.email,
    password: newPassword,
  })

  if (verificationError || !verificationData.session) {
    return {
      success: false,
      message: "Password updated, but sign-in verification failed. Please sign in again.",
    }
  }

  await supabaseClient.auth.setSession({
    access_token: verificationData.session.access_token,
    refresh_token: verificationData.session.refresh_token,
  })

  return {
    success: true,
    message: "Password updated successfully. Please use your new password for future sign-ins.",
  }
}
