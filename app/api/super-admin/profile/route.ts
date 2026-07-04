/**
 * Super Admin Profile Update API
 * Allows Super Admin to directly update their profile without approval workflow
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { normalizeStringArray } from "@/lib/utils"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * PUT /api/super-admin/profile
 * Update super admin profile and sync across system
 */
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

    // Verify user is super admin
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single()

    if (userError || user?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can update their profile directly" },
        { status: 403 }
      )
    }

    // Update user profile (excluding permanent fields)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        gender: profile.gender,
        dob: profile.dob,
        nationality: profile.nationality,
        district: profile.district,
        chiefdom: profile.chiefdom,
        town: profile.town,
        home_address: profile.homeAddress,
        current_address: profile.currentAddress,
        university: profile.university,
        campus: profile.campus,
        faculty: profile.faculty,
        department: profile.department,
        course: profile.courseName,
        level: profile.academicLevel,
        student_id: profile.studentId,
        admission_year: profile.admissionYear,
        graduation_year: profile.graduationYear,
        skills: profile.skills === undefined ? undefined : normalizeStringArray(profile.skills),
        occupation: profile.occupation,
        biography: profile.biography,
        emergency_contact: profile.emergencyContact,
        profile_photo: profile.profilePhoto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      throw updateError
    }

    // Create audit log entry
    await supabase.from("audit_logs").insert({
      actor_id: userId,
      actor_name: profile.fullName,
      action: "updated own profile",
      target: profile.fullName,
      type: "update",
      module: "Profile",
      status: "success",
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Super admin profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
