const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://bbtejqjftzqawivkysyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidGVqcWpmdHpxYXdpdmt5c3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU2MjkyMywiZXhwIjoyMDk4MTM4OTIzfQ.ipr1gVyW71Q4Ke_-3RmjCz_L7usyxuc9UwwMjk1yKTc',
  { auth: { persistSession: false } }
);

(async()=>{
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    if (data.length > 0) {
      console.log("Columns in 'users' table:", Object.keys(data[0]));
    } else {
      console.log("No data returned to infer columns.");
    }
  }
})();
