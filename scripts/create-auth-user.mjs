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

async function createUser(payload) {
  return await adminClient.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: payload.user_metadata,
  })
}

async function getUserByEmail(email) {
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
  if (error) throw error

  const users = Array.isArray(data?.users) ? data.users : []
  return users.find((user) => user.email === email)
}

async function updateUser(userId, payload) {
  return await adminClient.auth.admin.updateUserById(userId, payload)
}

async function main() {
  const tempPassword = adminPassword || generateTemporaryPassword()
  const payload = {
    email: 'samuel540wisesamura@gmail.com',
    password: tempPassword,
    user_metadata: {
      full_name: 'Samuel Samura',
      phone: '+23279630777',
      role: 'super_admin',
      password_change_required: false,
    },
  }

  try {
    console.log('Temporary password (save this):', tempPassword)
    let result = await createUser(payload)

    const emailExists = result.error?.code === 'email_exists' || result.error?.error_code === 'email_exists'
    if (emailExists) {
      console.log('User already exists, updating existing account with the fixed admin password...')
      const existingUser = await getUserByEmail(payload.email)
      if (!existingUser?.id) throw new Error('Existing user found but no user id returned')
      result = await updateUser(existingUser.id, {
        password: tempPassword,
        user_metadata: payload.user_metadata,
      })
    }

    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error('Create user failed:', err.message || err)
    process.exit(1)
  }
}

main()
