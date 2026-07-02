import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:5gOOBrQe8CcFdssY@db.bbtejqjftzqawivkysyw.supabase.co:5432/postgres"

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not defined.")
  process.exit(1)
}

async function runMigration() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log("Connected to database. Reading schema-geography.sql...")

    const sqlPath = path.join(__dirname, "../lib/supabase/schema-geography.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    console.log("Executing SQL migration queries...")
    await client.query(sql)
    console.log("Migration executed successfully. Districts and Chiefdoms are seeded!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
