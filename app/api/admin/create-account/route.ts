import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function normalizeRole(role: string): string {
  if (role === "super_admin") return "super_admin"
  if (role === "executive") return "executive"
  return "stakeholder"
}

export async function POST(request: Request) {
  try {
    const { fullName, email, role, title } = await request.json()

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: "Full name and email are required." },
        { status: 400 },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Supabase is not configured for admin account creation." },
        { status: 500 },
      )
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const temporaryPassword = process.env.SUPABASE_INITIAL_ADMIN_PASSWORD || "NUKaFs-Admin-123!"
    const normalizedRole = normalizeRole(role || "executive")
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/login"

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: normalizedRole,
        status: "active",
        profile_completion: 100,
        password_change_required: false,
        title,
      },
    })

    let userRecord = createdUser?.user

    if (createUserError) {
      const errorMessage = createUserError.message || JSON.stringify(createUserError)
      const isEmailExists =
        errorMessage.includes("email_exists") ||
        errorMessage.includes("already been registered") ||
        errorMessage.includes("User already exists") ||
        createUserError.code === "email_exists"

      if (isEmailExists) {
        try {
          const { data: usersData, error: listUsersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
          if (listUsersError) {
            throw listUsersError
          }

          const existingUser = usersData?.users?.find((candidate) => candidate.email === email)
          if (!existingUser?.id) {
            throw new Error("Unable to locate an existing admin account for that email.")
          }

          const { data: updatedUser, error: updateUserError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
            password: temporaryPassword,
            user_metadata: {
              full_name: fullName,
              role: normalizedRole,
              status: "active",
              profile_completion: 100,
              password_change_required: false,
              title,
            },
          })

          if (updateUserError) {
            throw updateUserError
          }

          userRecord = updatedUser?.user
        } catch (handleError) {
          throw handleError instanceof Error ? handleError : new Error(String(handleError))
        }
      } else {
        throw createUserError
      }
    }

    const message = [
      `Hello ${fullName},`,
      "",
      "Your NUKaFs admin portal account has been created.",
      "",
      `Login URL: ${loginUrl}`,
      `Email: ${email}`,
      `Temporary password: ${temporaryPassword}`,
      "",
      "If you need help, contact syscend@gmail.com or +23279630777.",
      "",
      "Please sign in and change your password immediately.",
    ].join("\n")

    return NextResponse.json({
      success: true,
      userId: userRecord?.id,
      email,
      temporaryPassword,
      loginUrl,
      role: normalizedRole,
      fullName,
      title,
      message,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to create admin account.",
      },
      { status: 500 },
    )
  }
}
