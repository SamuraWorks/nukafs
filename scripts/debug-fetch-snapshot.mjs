import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase env vars not found. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function run() {
  try {
    const [{ data: studs }, { data: usersAll }, { data: studentUsers }] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('users').select('*').limit(10),
      supabase.from('users').select('*').ilike('membership_type', '%student%').limit(1000),
    ])

    console.log('students table count:', Array.isArray(studs) ? studs.length : 0)
    console.log('users sample count:', Array.isArray(usersAll) ? usersAll.length : 0)
    console.log('users with membership_type like student:', Array.isArray(studentUsers) ? studentUsers.length : 0)

    // look for a super admin user in users
    const { data: superAdmin } = await supabase.from('users').select('*').ilike('role', '%super%').limit(20)
    console.log('super admin matches:', (superAdmin || []).map(u => ({ id: u.id, email: u.email, membership_type: u.membership_type, membership_number: u.membership_number })))
  } catch (err) {
    console.error('Query error:', err)
    process.exit(2)
  }
}

run()
