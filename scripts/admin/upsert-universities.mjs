#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const universities = [
  'Fourah Bay College (USL)',
  'Njala University',
  'Institute of Public Administration (IPAM)',
  'Ernest Bai Koroma University',
  'Eastern Technical University',
  'Milton Margai Technical University',
  'Limkokwing University',
]

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function shortName(name) {
  return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 6).toUpperCase()
}

async function main() {
  const payload = universities.map((name) => ({
    name,
    short_name: shortName(name),
    campus: '',
    region: '',
    active: true,
  }))

  console.log('Upserting', payload.length, 'universities...')
  const { data, error } = await supabase.from('universities').upsert(payload, { onConflict: 'name' })
  if (error) {
    console.error('Failed to upsert universities:', error.message || error)
    process.exit(1)
  }

  console.log('Upsert complete. Result rows:', data?.length || 0)
}

main().catch(e => { console.error(e); process.exit(1) })
