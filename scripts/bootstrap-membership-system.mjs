/**
 * Bootstrap Script: Initialize Samuel Samura with NUKaFs-000001
 * 
 * Run this script once in production to permanently assign the first membership ID
 * to Samuel Samura as specified in requirements.
 * 
 * Usage: node scripts/bootstrap-membership-system.mjs
 */

import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Generate verification token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Bootstrap the membership system
 */
async function bootstrap() {
  console.log("🚀 Bootstrapping NUKaFs Membership ID System...")

  try {
    // 1. Find Samuel Samura's account
    console.log("📍 Looking for Samuel Samura...")
    const { data: samuels, error: findError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .or('email.eq.samuel540wisesamura@gmail.com,full_name.eq.Samuel Samura')

    if (findError) throw findError

    if (!samuels || samuels.length === 0) {
      console.error("❌ Samuel Samura not found. Please create the account first.")
      process.exit(1)
    }

    const samuel = samuels[0]
    console.log(`✓ Found: ${samuel.full_name} (${samuel.email})`)

    // 2. Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationUrl = `https://registry.nukafs-sl.org/verify/${verificationToken}`

    console.log("📝 Generating membership identity...")
    console.log(`   ID: NUKaFs-000001`)
    console.log(`   Type: Student (remains student even as Super Admin)`)
    console.log(`   QR Code Data: ${verificationUrl}`)

    // 3. Create membership identity
    const { error: identityError } = await supabase
      .from("membership_identities")
      .insert({
        user_id: samuel.id,
        membership_id: "NUKaFs-000001",
        membership_type: "student",
        verification_token: verificationToken,
        verification_url: verificationUrl,
        qr_code_data: verificationUrl,
        qr_code_status: "active",
        created_at: new Date().toISOString(),
      })

    if (identityError) {
      // Check if it already exists
      if (identityError.code === "23505") {
        console.log("⚠️  Membership identity already exists (unique constraint)")
      } else {
        throw identityError
      }
    } else {
      console.log("✓ Membership identity created")
    }

    // 4. Update user's membership fields
    const { error: updateError } = await supabase
      .from("users")
      .update({
        membership_number: "NUKaFs-000001",
        qr_code: verificationUrl,
        membership_sequence: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", samuel.id)

    if (updateError) throw updateError
    console.log("✓ User profile updated with membership ID")

    // 5. Initialize counters (set next to 2 since we just used 1)
    const { error: configError } = await supabase
      .from("system_config")
      .upsert({
        key: "student_membership_counter",
        value: { next: 2 },
        updated_at: new Date().toISOString(),
      })

    if (configError) throw configError
    console.log("✓ Student membership counter initialized (next: 2)")

    // 6. Initialize stakeholder counter
    await supabase.from("system_config").upsert({
      key: "stakeholder_membership_counter",
      value: { next: 1 },
      updated_at: new Date().toISOString(),
    })
    console.log("✓ Stakeholder membership counter initialized (next: 1)")

    // 7. Create audit log
    await supabase.from("audit_logs").insert({
      actor_id: samuel.id,
      actor_name: samuel.full_name,
      action: "bootstrapped membership system",
      target: "NUKaFs-000001",
      type: "system",
      module: "Membership",
      status: "success",
      ip: "BOOTSTRAP",
    })
    console.log("✓ Audit log created")

    console.log("\n✅ Bootstrap Complete!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`Super Admin: ${samuel.full_name}`)
    console.log(`Membership ID: NUKaFs-000001`)
    console.log(`Membership Type: Student (permanent)`)
    console.log(`System Role: Super Admin`)
    console.log(`Verification Token: ${verificationToken.substring(0, 16)}...`)
    console.log(`QR Code: ${verificationUrl}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

    console.log("Next steps:")
    console.log("1. Update Samuel's profile photo using the profile editor")
    console.log("2. Test QR code scanning at the verification page")
    console.log("3. Subsequent approved members will receive NUKaFs-000002, NUKaFs-000003, etc.")
    console.log(
      "4. Stakeholders will receive STK-000001, STK-000002, etc. in their own sequence\n"
    )
  } catch (error) {
    console.error("❌ Bootstrap failed:", error)
    process.exit(1)
  }
}

bootstrap()
