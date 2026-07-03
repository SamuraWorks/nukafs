import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase env vars not found. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function run() {
  const preferred = process.env.NEXT_PUBLIC_VERIFICATION_ORIGIN || 'https://nukafs.vercel.app'
  console.log('Using preferred origin:', preferred)

  const { data: rows, error } = await supabase.from('membership_identities').select('id, verification_url, qr_code_data')
  if (error) {
    console.error('Failed to fetch membership_identities:', error)
    process.exit(2)
  }

  const updates = []
  for (const r of rows || []) {
    if (!r.verification_url) continue
    try {
      const url = new URL(r.verification_url)
      const newUrl = `${preferred}/verify/${url.pathname.split('/').pop()}`
      const newQr = r.qr_code_data ? `${preferred}/verify/${r.qr_code_data.split('/').pop()}` : newUrl
      if (newUrl !== r.verification_url || newQr !== r.qr_code_data) {
        updates.push({ id: r.id, verification_url: newUrl, qr_code_data: newQr })
      }
    } catch (e) {
      // skip malformed
    }
  }

  console.log('Found', updates.length, 'records to update')
  for (const u of updates) {
    const { error: upErr } = await supabase.from('membership_identities').update({ verification_url: u.verification_url, qr_code_data: u.qr_code_data }).eq('id', u.id)
    if (upErr) console.error('Failed to update', u.id, upErr)
  }

  console.log('Done')
}

run()
