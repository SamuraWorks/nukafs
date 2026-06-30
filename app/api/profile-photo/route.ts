import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Photo upload endpoint for profile pictures
// Supports both mock (base64) and Supabase storage

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "No userId provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Convert file to base64 for storage
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const photoDataUrl = `data:${file.type};base64,${base64}`

    // If Supabase is configured, also store in bucket
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey)
        const fileName = `profile-photos/${userId}-${Date.now()}.${file.type.split("/")[1]}`

        const { data, error } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, file, { upsert: true })

        if (error) {
          console.error("Supabase storage error:", error)
          // Continue with base64 fallback
        } else if (data) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("profile-photos").getPublicUrl(fileName)

          // Update user profile in database
          const updateResult = await supabase
            .from("users")
            .update({ profile_photo: publicUrl })
            .eq("id", userId)

          if (updateResult.error) {
            console.error("Database update error:", updateResult.error)
          }

          return NextResponse.json({
            success: true,
            photoUrl: publicUrl,
            message: "Photo uploaded successfully",
          })
        }
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError)
        // Fall through to base64 response
      }
    }

    // Mock response with base64 data
    return NextResponse.json({
      success: true,
      photoUrl: photoDataUrl,
      message: "Photo uploaded successfully (mock mode)",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve photo metadata (for future use)
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "No userId provided" }, { status: 400 })
    }

    // Mock response - in production, fetch from Supabase
    return NextResponse.json({
      userId,
      photoUrl: null,
      uploadedAt: null,
    })
  } catch (error) {
    console.error("Error retrieving photo:", error)
    return NextResponse.json(
      { error: "Failed to retrieve photo" },
      { status: 500 }
    )
  }
}
