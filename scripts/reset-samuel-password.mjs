#!/usr/bin/env node
/*
  reset-samuel-password.mjs
  Usage:
    NODE_ENV=development NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co" SUPABASE_SERVICE_ROLE_KEY="<service-role>" node scripts/reset-samuel-password.mjs <user-id-or-email> <new-temporary-password>

  This script uses the Supabase Admin API via @supabase/supabase-js to update a user's password.
  If you pass an email (contains @), the script will lookup the user and update the matching account.
*/

import { createClient } from '@supabase/supabase-js'

const [,, identifier, newPassword] = process.argv

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

if (!identifier || !newPassword) {
  console.error('Usage: node scripts/reset-samuel-password.mjs <user-id-or-email> <new-temporary-password>')
  process.exit(1)
}

const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function findUserIdByEmail(email) {
  // listUsers supports paging; try first 1000 users
  const res = await client.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (res.error) throw res.error
  const user = (res.data?.users || []).find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
  return user?.id
}

async function updatePassword(userId) {
  const { data: currentUserData, error: currentUserError } = await client.auth.admin.getUserById(userId)
  if (currentUserError) throw currentUserError

  const existingMetadata = (currentUserData?.user?.user_metadata ?? {})
  const metadata = {
    ...existingMetadata,
    password_change_required: false,
  }

  const res = await client.auth.admin.updateUserById(userId, {
    password: newPassword,
    user_metadata: metadata,
  })
  if (res.error) throw res.error
  return res.data
}

;(async () => {
  try {
    let userId = identifier
    if (identifier.includes('@')) {
      console.log(`Looking up user by email: ${identifier}`)
      userId = await findUserIdByEmail(identifier)
      if (!userId) {
        console.error('User not found for email:', identifier)
        process.exit(2)
      }
      console.log('Found user id:', userId)
    }

    console.log('Updating password for user id:', userId)
    const updated = await updatePassword(userId)
    console.log('Password updated successfully for', userId)
    console.log('Note: user should be instructed to change this temporary password after login.')
    console.log(JSON.stringify(updated, null, 2))
  } catch (err) {
    console.error('Error updating password:', err.message || err)
    process.exit(3)
  }
})()
