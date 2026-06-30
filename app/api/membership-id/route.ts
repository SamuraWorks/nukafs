/**
 * Membership ID Generation API
 * Manages sequential ID allocation and QR code generation
 * 
 * This endpoint coordinates:
 * - Membership ID sequences (NUKAFS-000001, NUKAFS-000002, etc.)
 * - Stakeholder ID sequences (STK-000001, STK-000002, etc.)
 * - Permanent verification tokens for QR codes
 * - One-time allocation (never regenerated after creation)
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  createMembershipIdentity,
  isValidVerificationToken,
} from "@/lib/membership-id-system"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/membership-id
 * Retrieve current counters and get next available IDs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "get-next") {
      // Get next available IDs without allocating
      const membershipType = searchParams.get("type") || "student"

      const { data, error } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", `${membershipType}_membership_counter`)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      const counter = data?.value?.next || 1
      return NextResponse.json({
        membershipType,
        nextSequence: counter,
        nextId:
          membershipType === "stakeholder"
            ? `STK-${String(counter).padStart(6, "0")}`
            : `NUKAFS-${String(counter).padStart(6, "0")}`,
      })
    }

    if (action === "verify-token") {
      // Verify a token exists in database
      const token = searchParams.get("token")

      if (!token || !isValidVerificationToken(token)) {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from("membership_identities")
        .select("membership_id, user_id, created_at")
        .eq("verification_token", token)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json(
            { valid: false, error: "Token not found" },
            { status: 404 }
          )
        }
        throw error
      }

      return NextResponse.json({
        valid: true,
        membershipId: data.membership_id,
        createdAt: data.created_at,
      })
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Membership ID GET error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve membership ID info" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/membership-id
 * Allocate new membership ID and create identity
 * 
 * Called once when user account is approved for membership
 * Never called again - IDs are permanent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, membershipType = "student" } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    // Use RPC function to atomically increment counter and get next ID
    const counterKey = `${membershipType}_membership_counter`

    // Get current counter
    let { data: configData, error: configError } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", counterKey)
      .single()

    let nextSequence = 1
    if (configData?.value?.next) {
      nextSequence = configData.value.next
    }

    // Increment counter
    await supabase
      .from("system_config")
      .upsert(
        {
          key: counterKey,
          value: { next: nextSequence + 1 },
        },
        { onConflict: "key" }
      )

    // Create membership identity
    const identity = createMembershipIdentity(
      nextSequence,
      membershipType as "student" | "stakeholder"
    )

    // Store identity in database
    const { data: identityData, error: identityError } = await supabase
      .from("membership_identities")
      .insert({
        user_id: userId,
        membership_id: identity.membershipId,
        membership_type: membershipType,
        verification_token: identity.verificationToken,
        verification_url: identity.verificationUrl,
        qr_code_data: identity.qrCodeData,
        created_at: identity.createdAt,
      })
      .select()
      .single()

    if (identityError) {
      throw identityError
    }

    // Update user's membership_id in users table
    await supabase
      .from("users")
      .update({
        membership_number: identity.membershipId,
        qr_code: identity.qrCodeData,
      })
      .eq("id", userId)

    return NextResponse.json(
      {
        success: true,
        identity: {
          membershipId: identity.membershipId,
          verificationToken: identity.verificationToken,
          verificationUrl: identity.verificationUrl,
          qrCodeData: identity.qrCodeData,
          createdAt: identity.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Membership ID POST error:", error)
    return NextResponse.json(
      { error: "Failed to allocate membership ID" },
      { status: 500 }
    )
  }
}
