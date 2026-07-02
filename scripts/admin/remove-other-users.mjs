#!/usr/bin/env node
import 'dotenv/config'
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

async function main() {
  console.log('Listing application users that will be removed (keeping):', KEEP_EMAIL)
  const { data: users, error } = await supabase.from('users').select('id,email').neq('email', KEEP_EMAIL)
  if (error) {
    console.error('Failed to list users:', error.message || error)
    process.exit(1)
  }

  if (!users || users.length === 0) {
    console.log('No other users found. Nothing to delete.')
    return
  }

  console.table(users.map(u => ({ id: u.id, email: u.email })))

  if (CONFIRM !== 'yes') {
    console.log('\nTo perform deletions set CONFIRM=yes and re-run the script. No changes were made.')
    process.exit(0)
  }

  const ids = users.map(u => u.id)

  try {
    console.log('Deleting related membership identities...')
    await supabase.from('membership_identities').delete().in('user_id', ids)
  } catch (e) {
    console.warn('membership_identities deletion may have failed or table missing:', e?.message || e)
  }

  try {
    console.log('Deleting registrations...')
    await supabase.from('registrations').delete().in('user_id', ids)
  } catch (e) {
    console.warn('registrations deletion may have failed or table missing:', e?.message || e)
  }

  try {
    console.log('Deleting students table rows (if present)...')
    await supabase.from('students').delete().in('user_id', ids)
  } catch (e) {
    console.warn('students deletion may have failed or table missing:', e?.message || e)
  }

  try {
    console.log('Deleting user profile records from `users` table...')
    await supabase.from('users').delete().in('id', ids)
  } catch (e) {
    console.warn('users deletion failed:', e?.message || e)
  }

  console.log('Deletion attempts complete. Note: if you also need to remove auth users, ensure you used the Supabase Auth admin API separately (or it was already deleted).')
}

main().catch(err => {
  console.error('Error during cleanup:', err)
  process.exit(1)
})
