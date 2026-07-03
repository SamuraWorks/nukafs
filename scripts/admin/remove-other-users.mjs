#!/usr/bin/env node
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
const KEEP_EMAIL = process.env.KEEP_EMAIL
const CONFIRM = process.env.CONFIRM

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}
if (!KEEP_EMAIL) {
  console.error('Set KEEP_EMAIL env var to the email address you want to preserve (e.g. your Samuel account).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function authHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function listAuthUsers() {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?limit=500`
  const res = await fetch(url, { method: 'GET', headers: authHeaders() })
  if (!res.ok) {
    throw new Error(`Auth listUsers failed: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return Array.isArray(data.users) ? data.users : []
}

async function deleteAuthUser(id) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${id}`
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) {
    throw new Error(`Delete auth user ${id} failed: ${res.status} ${await res.text()}`)
  }
}

async function main() {
  console.log('Listing application users that will be removed (keeping):', KEEP_EMAIL)
  const { data: users, error } = await supabase.from('users').select('id,email').neq('email', KEEP_EMAIL)
  if (error) {
    console.error('Failed to list users:', error.message || error)
    process.exit(1)
  }

  const ids = Array.isArray(users) ? users.map(u => u.id) : []
  if (ids.length === 0) {
    console.log('No other users found in public.users.')
  } else {
    console.table(users.map(u => ({ id: u.id, email: u.email })))
  }

  if (CONFIRM !== 'yes') {
    console.log('\nTo perform deletions set CONFIRM=yes and re-run the script. No changes were made.')
    process.exit(0)
  }

  try {
    if (ids.length > 0) {
      console.log('Deleting related membership identities...')
      await supabase.from('membership_identities').delete().in('user_id', ids)

      console.log('Deleting registrations...')
      await supabase.from('registrations').delete().in('user_id', ids)

      console.log('Deleting students table rows (if present)...')
      await supabase.from('students').delete().in('user_id', ids)

      console.log('Deleting user profile records from `users` table...')
      await supabase.from('users').delete().in('id', ids)
    }
  } catch (e) {
    console.warn('Data deletion may have failed or table missing:', e?.message || e)
  }

  try {
    console.log('Deleting auth users except:', KEEP_EMAIL)
    const authUsers = await listAuthUsers()
    const otherAuthIds = authUsers.filter((user) => user.email !== KEEP_EMAIL).map((user) => user.id)

    for (const id of otherAuthIds) {
      try {
        await deleteAuthUser(id)
        console.log('Deleted auth user', id)
      } catch (deleteError) {
        console.warn('Failed to delete auth user', id, deleteError.message || deleteError)
      }
    }
  } catch (e) {
    console.warn('auth user cleanup skipped or failed:', e?.message || e)
  }

  console.log('Deletion attempts complete.')
}

main().catch(err => {
  console.error('Error during cleanup:', err)
  process.exit(1)
})
