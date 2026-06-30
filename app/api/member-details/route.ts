/**
 * Member Details API
 * Retrieves public verified member information by membership ID
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSignedUrl } from "@/lib/supabase/storage-config"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const membershipId = searchParams.get("membershipId")

    if (!membershipId) {
      return NextResponse.json(
        { error: "Missing membershipId" },
        { status: 400 }
      )
    }

    // Get user by membership_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        membership_number,
        profile_photo,
        role,
        university,
        department,
        course,
        level,
        skills,
        status,
        created_at
      `
      )
      .eq("membership_number", membershipId)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Get profile photo signed URL if it exists
    let profilePhotoUrl: string | null = null
    if (user.profile_photo) {
      profilePhotoUrl = await getSignedUrl(
        supabase,
        "profile-photos",
        user.profile_photo,
        7 * 24 * 60 * 60 // 7 days
      )
    }

    return NextResponse.json({
      membershipId: user.membership_number,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      profilePhoto: profilePhotoUrl,
      university: user.university,
      department: user.department,
      courseName: user.course,
      academicLevel: user.level,
      skills: user.skills || [],
      verificationStatus: "verified",
      createdAt: user.created_at,
      role: user.role || "Member",
    })
  } catch (error) {
    console.error("Member details error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve member details" },
      { status: 500 }
    )
  }
}
