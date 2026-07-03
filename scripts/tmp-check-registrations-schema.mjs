import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const client = new Client({ connectionString: dbUrl })

try {
  await client.connect()
  const res = await client.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='registrations' ORDER BY ordinal_position`)
  console.log(JSON.stringify(res.rows, null, 2))
} catch (error) {
  console.error('Error querying schema:', error)
  process.exit(1)
} finally {
  await client.end()
}
