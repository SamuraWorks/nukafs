import { createClient } from "@supabase/supabase-js"

export interface SuperAdminSeedPayload {
  fullName: string
  email: string
  phone: string
  university: string
  faculty: string
  department: string
  course: string
  level: string
  primarySkill: string
  additionalSkills?: string[]
}

export interface SuperAdminSeedResult {
  success: boolean
  message: string
  userId?: string
  membershipNumber?: string
  qrCode?: string
  temporaryPassword?: string
}

function generateTemporaryPassword(): string {
  const suffix = Math.random().toString(36).slice(-8).toUpperCase()
  return `NUKAFS-${suffix}!`
}

function buildMembershipNumber(): string {
  // Samuel Samura as first approved member gets NUKAFS-000001
  return "NUKAFS-000001"
}

function buildQrCode(membershipNumber: string): string {
  // Generate QR code from membership ID (e.g., NUKAFS-000001 -> NUKAFS-QR-000001)
  return membershipNumber.replace("NUKAFS-", "NUKAFS-QR-")
}

export async function createInitialSuperAdminSeed(
  payload: SuperAdminSeedPayload,
): Promise<SuperAdminSeedResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role credentials are not configured.")
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const temporaryPassword = process.env.SUPABASE_INITIAL_ADMIN_PASSWORD || generateTemporaryPassword()
  const membershipNumber = buildMembershipNumber()
  const qrCode = buildQrCode(membershipNumber)
  const joinedDate = new Date().toISOString().split("T")[0]

  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email: payload.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: payload.fullName,
      phone: payload.phone,
      role: "super_admin",
      status: "active",
      profile_completion: 100,
      password_change_required: false,
      membership_type: "Student",
      membership_status: "active",
      verification_status: "Verified",
      account_status: "Approved",
      university: payload.university,
      faculty: payload.faculty,
      department: payload.department,
      course: payload.course,
      level: payload.level,
      primary_skill: payload.primarySkill,
      additional_skills: payload.additionalSkills ?? [],
    },
  })

  if (createUserError || !createdUser?.user) {
    throw new Error(createUserError?.message ?? "Failed to create Supabase auth user")
  }

  const { error: profileError } = await adminClient.from("users").upsert(
    {
      id: createdUser.user.id,
      email: payload.email,
      phone: payload.phone,
      full_name: payload.fullName,
      role: "super_admin",
      status: "active",
      profile_completion: 100,
      membership_number: membershipNumber,
      university: payload.university,
      course: payload.course,
      department: payload.department,
      level: payload.level,
      district: "",
      chiefdom: "",
      employment_status: "Student",
      skills: [payload.primarySkill, ...(payload.additionalSkills ?? [])],
      scholarship_applicant: false,
      joined_date: joinedDate,
      avatar_color: "oklch(0.52 0.12 158)",
      qr_code: qrCode,
      qr_code_status: "active",
      date_issued: joinedDate,
      is_migrated_to_digital_registry: false,
      legacy_membership_history: "Bootstrapped initial super admin",
      membership_type: "Student",
      membership_status: "active",
      verification_status: "Verified",
      account_status: "Approved",
      password_change_required: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (profileError) {
    throw new Error(profileError.message ?? "Failed to write super admin profile")
  }

  return {
    success: true,
    message: "Initial super admin created successfully.",
    userId: createdUser.user.id,
    membershipNumber,
    qrCode,
    temporaryPassword,
  }
}
