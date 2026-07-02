#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
const KEEP_EMAIL = process.env.KEEP_EMAIL
const FORCE = process.env.FORCE === 'yes'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}
if (!KEEP_EMAIL) {
  console.error('Set KEEP_EMAIL env var to the email address for Samuel (e.g. samuel@example.com).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function getOrigin() {
  return process.env.NEXT_PUBLIC_APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://registry.nukafs-sl.org')
}

async function main() {
  // Find Samuel user
  const { data: users, error: userErr } = await supabase.from('users').select('id,email').eq('email', KEEP_EMAIL).limit(1).maybeSingle()
  if (userErr) {
    console.error('Error querying users:', userErr.message || userErr)
    process.exit(1)
  }
  const samuel = users
  if (!samuel) {
    console.error('No user found with email', KEEP_EMAIL)
    process.exit(1)
  }

  console.log('Samuel user id:', samuel.id)

  // Check existing identity with NUKaFs-000001
  const { data: existingId, error: existingErr } = await supabase.from('membership_identities').select('user_id,membership_id').eq('membership_id', 'NUKaFs-000001').maybeSingle()
  if (existingErr) {
    console.warn('Error checking membership_identities:', existingErr.message || existingErr)
  }

  if (existingId && existingId.user_id !== samuel.id) {
    console.log('Found an existing membership identity for 000001 owned by another user:', existingId.user_id)
    if (!FORCE) {
      console.error('Set FORCE=yes to reassign (this will remove the existing identity). Aborting.')
      process.exit(1)
    }

    console.log('FORCE=yes, deleting existing identity and clearing their membership_number...')
    await supabase.from('membership_identities').delete().eq('membership_id', 'NUKaFs-000001')
    await supabase.from('users').update({ membership_number: null, qr_code: null }).eq('id', existingId.user_id)
  }

  // Check if Samuel already has an identity
  const { data: samuelIdentity } = await supabase.from('membership_identities').select('membership_id').eq('user_id', samuel.id).maybeSingle()
  if (samuelIdentity && samuelIdentity.membership_id === 'NUKaFs-000001') {
    console.log('Samuel already has membership NUKaFs-000001. No action needed.')
  } else if (samuelIdentity && samuelIdentity.membership_id !== 'NUKaFs-000001') {
    console.log('Samuel has an existing different membership:', samuelIdentity.membership_id)
    if (!FORCE) {
      console.error('Set FORCE=yes to override Samuel existing identity. Aborting.')
      process.exit(1)
    }
    console.log('FORCE=yes, deleting Samuel existing identity and creating NUKaFs-000001')
    await supabase.from('membership_identities').delete().eq('user_id', samuel.id)
  }

  // Insert identity for Samuel if missing
  const token = generateToken()
  const origin = getOrigin()
  const verificationUrl = `${origin}/verify/${token}`

  const { data: insertData, error: insertErr } = await supabase.from('membership_identities').upsert({
    user_id: samuel.id,
    membership_id: 'NUKaFs-000001',
    membership_type: 'student',
    verification_token: token,
    verification_url: verificationUrl,
    qr_code_data: verificationUrl,
    qr_code_status: 'active',
    created_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select().maybeSingle()

  if (insertErr) {
    console.error('Failed to upsert membership_identities for Samuel:', insertErr.message || insertErr)
    process.exit(1)
  }

  // Update users table membership number and qr code
  await supabase.from('users').update({ membership_number: 'NUKaFs-000001', qr_code: verificationUrl }).eq('id', samuel.id)

  console.log('Samuel assigned NUKaFs-000001')

  // Ensure system counter is at least 2
  const { data: cfg, error: cfgErr } = await supabase.from('system_config').select('value').eq('key', 'student_membership_counter').maybeSingle()
  if (cfgErr) {
    console.warn('Error reading system_config:', cfgErr.message || cfgErr)
  }
  const currentNext = cfg?.value?.next ?? 1
  if (currentNext <= 1) {
    console.log('Setting student_membership_counter next=2')
    await supabase.from('system_config').upsert({ key: 'student_membership_counter', value: { next: 2 } }, { onConflict: 'key' })
  } else {
    console.log('system_config student_membership_counter already at', currentNext)
  }

  console.log('Done.')
}

main().catch(e => { console.error('Error:', e); process.exit(1) })
