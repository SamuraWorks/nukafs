/**
 * Profile Photo Upload API
 * Handles secure file upload to Supabase Storage with database sync
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { initializeStorageBuckets, uploadToStorage, getSignedUrl } from "@/lib/supabase/storage-config"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/profile-photo-upload
 * Upload profile photo to Supabase Storage
 * 
 * Body: FormData with file
 * Headers: Authorization: Bearer token, X-User-Id: userId
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from header (must be authenticated)
    const userId = request.headers.get("X-User-Id")
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - missing user ID" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    await initializeStorageBuckets(supabase)

    // Upload to profile-photos bucket
    const result = await uploadToStorage(
      supabase,
      "profile-photos",
      userId,
      file,
      file.name || "profile.jpg"
    )

    if (!result) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

    // Update the user's stored photo path plus a signed URL for quick display.
    let { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        profile_photo: result.path,
        profile_photo_url: result.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, profile_photo, profile_photo_url")
      .single()

    if (updateError) {
      console.error("Failed to update profile_photo in database:", updateError)
      return NextResponse.json(
        { error: "Failed to persist profile photo metadata" },
        { status: 500 },
      )
    }

    if (!updatedUser) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      if (authError || !authUser) {
        console.error("Profile photo upload failed because user row is missing and auth lookup failed:", authError)
        return NextResponse.json(
          { error: "User not found when saving profile photo" },
          { status: 404 },
        )
      }

      const email = authUser.email || authUser.user_metadata?.email || authUser.user_metadata?.full_name
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.fullName || authUser.email || "Unknown User"

      if (!email) {
        console.error("Cannot create missing user row for profile photo upload because auth user has no email.")
        return NextResponse.json(
          { error: "Failed to persist profile photo metadata: missing user identity" },
          { status: 500 },
        )
      }

      const { data: createdUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          full_name: fullName,
          district: authUser.user_metadata?.district || "Unknown",
          chiefdom: authUser.user_metadata?.chiefdom || "Unknown",
          profile_photo: result.path,
          profile_photo_url: result.url,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select("id, profile_photo, profile_photo_url")
        .single()

      if (createError) {
        console.error("Failed to create missing user row for profile photo metadata:", createError)
        return NextResponse.json(
          { error: "Failed to persist profile photo metadata" },
          { status: 500 },
        )
      }

      updatedUser = createdUser
    }

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        path: result.path,
        user: updatedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Profile photo upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload profile photo" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/profile-photo-upload
 * Get signed URL for existing profile photo
 * 
 * Query params:
 *   userId: The user ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    // Get user's profile_photo path
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("profile_photo")
      .eq("id", userId)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (!user.profile_photo) {
      return NextResponse.json(
        { error: "No profile photo" },
        { status: 404 }
      )
    }

    // Generate signed URL
    const signedUrl = await getSignedUrl(
      supabase,
      "profile-photos",
      user.profile_photo,
      7 * 24 * 60 * 60 // 7 days
    )

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: signedUrl,
      path: user.profile_photo,
    })
  } catch (error) {
    console.error("Profile photo GET error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve profile photo" },
      { status: 500 }
    )
  }
}
