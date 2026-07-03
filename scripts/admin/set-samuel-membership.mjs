#!/usr/bin/env node
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
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

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function getOrigin() {
  return (
    process.env.NEXT_PUBLIC_VERIFICATION_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://nukafs.vercel.app')
  )
}

async function updateUserColumns(userId, values) {
  if (Object.keys(values).length === 0) {
    return
  }

  const { error } = await supabase.from('users').update(values).eq('id', userId)
  if (error) {
    console.warn('Could not update users row; maybe some columns are missing:', error.message || error)
  }
}

async function main() {
  const hasMembershipNumber = true
  const hasQrCode = true
  const hasQrCodeStatus = true
  const hasPermanentQrCode = true

  // Find Samuel user's auth row by email using direct Supabase admin REST
  const authUsers = await listAuthUsers()
  const samuelAuth = authUsers.find((user) => user.email === KEEP_EMAIL)

  if (!samuelAuth) {
    console.error('No auth user found with email', KEEP_EMAIL)
    process.exit(1)
  }

  const samuel = { id: samuelAuth.id, email: samuelAuth.email }
  console.log('Samuel auth user id:', samuel.id)

  // Ensure a corresponding app user row exists in public.users
  const { data: userRow, error: findUserErr } = await supabase.from('users').select('id,email,full_name').eq('id', samuel.id).maybeSingle()
  if (findUserErr) {
    console.warn('Could not query app users row:', findUserErr.message || findUserErr)
  }

  if (!userRow) {
    const { error: insertErr } = await supabase.from('users').insert({
      id: samuel.id,
      email: samuel.email,
      full_name: 'Samuel Samura',
      role: 'super_admin',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (insertErr) {
      console.error('Failed to create app user row for Samuel:', insertErr.message || insertErr)
      process.exit(1)
    }
    console.log('Created app user row for Samuel')
  }

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
    await updateUserColumns(existingId.user_id, {
      ...(hasMembershipNumber ? { membership_number: null } : {}),
      ...(hasQrCode ? { qr_code: null } : {}),
    })
  }

  // Check if Samuel already has an identity
  const { data: samuelIdentity } = await supabase.from('membership_identities').select('membership_id').eq('user_id', samuel.id).maybeSingle()
  if (samuelIdentity && samuelIdentity.membership_id === 'NUKaFs-000001') {
    console.log('Samuel already has membership NUKaFs-000001. No action needed.')
  } else {
    if (samuelIdentity && samuelIdentity.membership_id !== 'NUKaFs-000001') {
      console.log('Samuel has an existing different membership:', samuelIdentity.membership_id)
      if (!FORCE) {
        console.error('Set FORCE=yes to override Samuel existing identity. Aborting.')
        process.exit(1)
      }
      console.log('FORCE=yes, deleting Samuel existing identity and creating NUKaFs-000001')
      await supabase.from('membership_identities').delete().eq('user_id', samuel.id)
    }

      // Insert identity for Samuel with a clean row.
      const token = generateToken()
      const origin = getOrigin()
      const verificationUrl = `${origin}/verify/${token}`

      const { error: insertErr } = await supabase.from('membership_identities').insert({
        user_id: samuel.id,
        membership_id: 'NUKaFs-000001',
        membership_type: 'student',
        verification_token: token,
        verification_url: verificationUrl,
        qr_code_data: verificationUrl,
        qr_code_status: 'active',
        created_at: new Date().toISOString(),
      })

      if (insertErr) {
        console.error('Failed to insert membership_identities for Samuel:', insertErr.message || insertErr)
      console.warn('Could not update app user row for Samuel:', userUpdateErr.message || userUpdateErr)
    }

    try {
      await supabase.from('users').update({ membership_number: 'NUKaFs-000001', qr_code: verificationUrl }).eq('id', samuel.id)
    } catch (membershipUpdateError) {
      console.warn('Could not set membership_number or qr_code on users row:', membershipUpdateError.message || membershipUpdateError)
    }

    console.log('Samuel assigned NUKaFs-000001')
  }

  // Ensure system counter is at least 2
  const { data: cfg, error: cfgErr } = await supabase.from('system_config').select('value').eq('key', 'student_membership_counter').maybeSingle()
  if (cfgErr) {
    console.warn('Error reading system_config:', cfgErr.message || cfgErr)
  }
  const currentNext = cfg?.value?.next ?? 1
  if (currentNext <= 1) {
    console.log('Setting student_membership_counter next=2')
    const { error: counterErr } = await supabase.from('system_config').upsert({ key: 'student_membership_counter', value: { next: 2 } }, { onConflict: 'key' })
    if (counterErr) {
      console.warn('Failed to update student_membership_counter:', counterErr.message || counterErr)
    }
  } else {
    console.log('system_config student_membership_counter already at', currentNext)
  }

  console.log('Done.')
}

main().catch(e => { console.error('Error:', e); process.exit(1) })
