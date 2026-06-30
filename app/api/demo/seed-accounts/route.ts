import { createClient } from '@supabase/supabase-js'
import { DEMO_ACCOUNTS, DEMO_MODE_ENABLED } from '@/lib/config/demo-config'
import { generateMembershipId, createMembershipQRData } from '@/lib/membership-identity'
import { NextResponse } from 'next/server'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * POST /api/demo/seed-accounts
 * Seeds demo accounts for all roles (only works when DEMO_MODE_ENABLED)
 * Creates auth users, profiles, and membership records
 */
export async function POST(request: Request) {
  try {
    // Check if demo mode is enabled
    if (!DEMO_MODE_ENABLED) {
      return NextResponse.json(
        { success: false, message: 'Demo mode is not enabled' },
        { status: 403 }
      )
    }

    const results = []

    // Get the highest existing membership ID to continue sequence
    const { data: existingMembers } = await supabase
      .from('profiles')
      .select('membership_id')
      .order('membership_id', { ascending: false })
      .limit(1)

    let nextSequence = 1
    if (existingMembers && existingMembers.length > 0 && existingMembers[0].membership_id) {
      const lastId = existingMembers[0].membership_id
      const match = lastId.match(/NUKAFS-(\d+)/)
      if (match) {
        nextSequence = parseInt(match[1]) + 1
      }
    }

    // Seed each demo account
    for (const [accountType, accountData] of Object.entries(DEMO_ACCOUNTS)) {
      const membershipId = generateMembershipId(nextSequence++)
      const qrData = createMembershipQRData(accountData.id, membershipId)

      try {
        // 1. Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: accountData.email,
          password: accountData.password,
          email_confirm: true,
          user_metadata: {
            fullName: accountData.fullName,
            role: accountData.role,
            is_demo: true,
          },
        })

        if (authError) {
          // If user already exists, try to update
          if (authError.message.includes('already registered')) {
            results.push({
              accountType,
              status: 'exists',
              message: `Demo account ${accountData.email} already exists`,
            })
            continue
          }
          throw authError
        }

        if (!authUser.user) {
          throw new Error('No user created')
        }

        // 2. Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authUser.user.id,
          email: accountData.email,
          full_name: accountData.fullName,
          phone: accountData.phone,
          role: accountData.role,
          status: accountData.status,
          membership_id: membershipId,
          membership_qr_data: qrData,
          date_issued: new Date().toISOString(),
          is_demo: true,
        })

        if (profileError) throw profileError

        // 3. Add additional data based on role
        if (accountData.role === 'student') {
          await supabase.from('students').insert({
            id: authUser.user.id,
            email: accountData.email,
            full_name: accountData.fullName,
            university: accountData.university,
            status: 'active',
          })
        } else if (['executive', 'stakeholder', 'admin', 'super_admin'].includes(accountData.role)) {
          await supabase.from('team_members').insert({
            id: authUser.user.id,
            email: accountData.email,
            full_name: accountData.fullName,
            role: accountData.role === 'admin' ? 'executive' : accountData.role,
            title: accountData.title,
            status: accountData.status,
          })
        }

        results.push({
          accountType,
          status: 'success',
          userId: authUser.user.id,
          email: accountData.email,
          membershipId,
          password: accountData.password,
        })
      } catch (error: any) {
        results.push({
          accountType,
          status: 'error',
          message: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts seeding completed',
      results,
    })
  } catch (error: any) {
    console.error('Demo seed error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/demo/seed-accounts
 * Returns demo account credentials (only in demo mode)
 */
export async function GET() {
  if (!DEMO_MODE_ENABLED) {
    return NextResponse.json(
      { success: false, message: 'Demo mode is not enabled' },
      { status: 403 }
    )
  }

  const accounts = Object.entries(DEMO_ACCOUNTS).map(([type, account]) => ({
    type,
    email: account.email,
    password: account.password,
    fullName: account.fullName,
    role: account.role,
  }))

  return NextResponse.json({
    success: true,
    demoModeEnabled: DEMO_MODE_ENABLED,
    accounts,
  })
}
