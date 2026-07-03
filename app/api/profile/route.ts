import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 },
      )
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch profile" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, profile } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    // Build update payload — only include fields that are explicitly provided
    const rawPayload: Record<string, any> = {
      full_name: profile?.fullName,
      email: profile?.email,
      phone: profile?.phone,
      gender: profile?.gender,
      dob: profile?.dob,
      nationality: profile?.nationality,
      district: profile?.district,
      chiefdom: profile?.chiefdom,
      town: profile?.town,
      home_address: profile?.homeAddress,
      current_address: profile?.currentAddress,
      university: profile?.university,
      campus: profile?.campus,
      faculty: profile?.faculty,
      department: profile?.department,
      course: profile?.courseName ?? profile?.course,
      level: profile?.academicLevel ?? profile?.level,
      student_id: profile?.studentId ?? profile?.studentIdNumber,
      admission_year: profile?.admissionYear,
      graduation_year: profile?.graduationYear,
      expected_graduation_year: profile?.expectedGraduationYear ?? profile?.expectedGradYear,
      college: profile?.college,
      organization: profile?.organization,
      skills: profile?.skills,
      occupation: profile?.occupation,
      biography: profile?.biography,
      emergency_contact: profile?.emergencyContact,
      employment_status: profile?.employmentStatus,
      profile_photo: profile?.profilePhoto,
      profile_photo_url: profile?.profilePhotoUrl,
      profile_completion: profile?.profileCompletion,
      // Approval fields — only set when provided
      status: profile?.status,
      verification_status: profile?.verificationStatus,
      role: profile?.role,
      date_approved: profile?.dateApproved,
      membership_number: profile?.membershipNumber,
      qr_code: profile?.qrCode,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined entries so we don't overwrite existing DB values with null
    const updatePayload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, v]) => v !== undefined)
    )

    const { data: updatedUserData, error: upsertError } = await supabase
      .from("users")
      .upsert({ id: userId, ...updatePayload }, { onConflict: "id" })
      .select("*")

    if (upsertError) {
      throw upsertError
    }

    const updatedUser = Array.isArray(updatedUserData) ? updatedUserData[0] : updatedUserData

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found after update" },
        { status: 404 },
      )
    }

    await supabase.from("audit_logs").insert({
      actor_id: userId,
      actor_name: profile?.fullName ?? "User",
      action: "updated own profile",
      target: profile?.fullName ?? userId,
      type: "update",
      module: "Profile",
      status: "success",
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("Profile update error:", error)
    const message = error?.message || error?.details || "Failed to update profile"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
