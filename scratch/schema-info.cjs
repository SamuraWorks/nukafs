const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    connectionString: "postgresql://postgres:5gOOBrQe8CcFdssY@db.bbtejqjftzqawivkysyw.supabase.co:5432/postgres"
  });
  
  await client.connect();
  
  // List all tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  
  console.log("Tables in public schema:");
  for (const row of tablesRes.rows) {
    console.log(`- ${row.table_name}`);
  }
  
  await client.end();
}

checkSchema().catch(console.error);
