import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const updatePayload = {
      full_name: profile?.fullName ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      gender: profile?.gender ?? null,
      dob: profile?.dob ?? null,
      nationality: profile?.nationality ?? null,
      district: profile?.district ?? null,
      chiefdom: profile?.chiefdom ?? null,
      town: profile?.town ?? null,
      home_address: profile?.homeAddress ?? null,
      current_address: profile?.currentAddress ?? null,
      university: profile?.university ?? null,
      campus: profile?.campus ?? null,
      faculty: profile?.faculty ?? null,
      department: profile?.department ?? null,
      course: profile?.courseName ?? null,
      level: profile?.academicLevel ?? null,
      student_id: profile?.studentId ?? null,
      admission_year: profile?.admissionYear ?? null,
      graduation_year: profile?.graduationYear ?? null,
      skills: profile?.skills ?? [],
      occupation: profile?.occupation ?? null,
      biography: profile?.biography ?? null,
      emergency_contact: profile?.emergencyContact ?? null,
      profile_photo: profile?.profilePhoto ?? null,
      profile_photo_url: profile?.profilePhotoUrl ?? null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId)

    if (error) {
      throw error
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
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
