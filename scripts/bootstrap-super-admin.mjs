import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (!m) continue
    const key = m[1].trim()
    let val = m[2].trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    process.env[key] = val
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadDotEnv(path.resolve(__dirname, '..', '.env.local'))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_KEY in environment or .env.local')
  process.exit(1)
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY)

function generateTemporaryPassword() {
  const suffix = Math.random().toString(36).slice(-8).toUpperCase()
  return `NUKaFs-${suffix}!`
}

const adminPassword = process.env.SUPABASE_INITIAL_ADMIN_PASSWORD || "NUKaFs-Admin-123!"

function buildMembershipNumber() {
  const year = new Date().getFullYear()
  const sequence = String(Date.now()).slice(-4)
  return `NUKaFs-${year}-${sequence}`
}
function buildQrCode(membershipNumber) {
  return `NUKaFs-QR-${membershipNumber.replace(/\D/g, "")}`
}

async function createUser(payload) {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: payload.user_metadata,
  })
  return { data, error }
}

async function getUserByEmail(email) {
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
  if (error) throw error

  const users = Array.isArray(data?.users) ? data.users : []
  return users.find((user) => user.email === email)
}

async function updateUser(userId, payload) {
  const { data, error } = await adminClient.auth.admin.updateUserById(userId, payload)
  if (error) throw error
  return { data, error: null }
}

async function upsertProfile(profile) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/users`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify([profile]),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data
}

async function main() {
  const payload = {
    fullName: 'Samuel Samura',
    email: 'samuel540wisesamura@gmail.com',
    phone: '+23279630777',
    university: 'Fourah Bay College',
    faculty: 'Engineering',
    department: 'Electrical and Electronics Engineering',
    course: 'Electrical and Electronics Engineering',
    level: 'Year 4',
    primarySkill: 'Software Development',
    additionalSkills: [],
  }

  const temporaryPassword = adminPassword || generateTemporaryPassword()
  const membershipNumber = buildMembershipNumber()
  const qrCode = buildQrCode(membershipNumber)
  const joinedDate = new Date().toISOString().split('T')[0]

  try {
    console.log('Creating auth user...')
    let created = await createUser({
      email: payload.email,
      password: temporaryPassword,
      user_metadata: {
        full_name: payload.fullName,
        phone: payload.phone,
        role: 'super_admin',
        status: 'active',
        profile_completion: 100,
        password_change_required: false,
        membership_type: 'Student',
        membership_status: 'active',
        verification_status: 'Verified',
        account_status: 'Approved',
        university: payload.university,
        faculty: payload.faculty,
        department: payload.department,
        course: payload.course,
        level: payload.level,
        primary_skill: payload.primarySkill,
        additional_skills: payload.additionalSkills ?? [],
      },
    })

    const emailExists = created.error?.code === 'email_exists' || created.error?.error_code === 'email_exists'
    if (emailExists) {
      console.log('Supabase user already exists, updating password and metadata...')
      const existingUser = await getUserByEmail(payload.email)
      if (!existingUser?.id) throw new Error('Existing user found but no user id returned')
      await updateUser(existingUser.id, {
        password: temporaryPassword,
        user_metadata: {
          full_name: payload.fullName,
          phone: payload.phone,
          role: 'super_admin',
          status: 'active',
          profile_completion: 100,
          password_change_required: false,
          membership_type: 'Student',
          membership_status: 'active',
          verification_status: 'Verified',
          account_status: 'Approved',
          university: payload.university,
          faculty: payload.faculty,
          department: payload.department,
          course: payload.course,
          level: payload.level,
          primary_skill: payload.primarySkill,
          additional_skills: payload.additionalSkills ?? [],
        },
      })
      created = await getUserByEmail(payload.email)
    }

    const userId = created.id || (created.user && created.user.id) || created?.id
    if (!userId) throw new Error('No user id returned from auth create')

    console.log('Upserting profile row...')
    const profile = {
      id: userId,
      email: payload.email,
      phone: payload.phone,
      full_name: payload.fullName,
      role: 'super_admin',
      status: 'active',
      profile_completion: 100,
      membership_number: membershipNumber,
      university: payload.university,
      course: payload.course,
      department: payload.department,
      level: payload.level,
      district: '',
      chiefdom: '',
      employment_status: 'Student',
      skills: [payload.primarySkill, ...(payload.additionalSkills ?? [])],
      scholarship_applicant: false,
      joined_date: joinedDate,
      avatar_color: 'oklch(0.52 0.12 158)',
      qr_code: qrCode,
      qr_code_status: 'active',
      date_issued: joinedDate,
      is_migrated_to_digital_registry: false,
      legacy_membership_history: 'Bootstrapped initial super admin',
      membership_type: 'Student',
      membership_status: 'active',
      verification_status: 'Verified',
      account_status: 'Approved',
      password_change_required: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const upserted = await upsertProfile(profile)

    console.log(JSON.stringify({ success: true, userId, membershipNumber, qrCode, temporaryPassword, upserted }, null, 2))
  } catch (err) {
    console.error('Bootstrap failed:', err.message || err)
    process.exit(1)
  }
}

main()
