const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://bbtejqjftzqawivkysyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidGVqcWpmdHpxYXdpdmt5c3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU2MjkyMywiZXhwIjoyMDk4MTM4OTIzfQ.ipr1gVyW71Q4Ke_-3RmjCz_L7usyxuc9UwwMjk1yKTc',
  { auth: { persistSession: false } }
);

(async()=>{
  const { data, error } = await supabase.from('students').select('*');
  console.log('error', error ? JSON.stringify(error) : null);
  console.log('students count', data ? data.length : 0);
  if (data && data.length > 0) {
    console.log('First student:', JSON.stringify(data[0], null, 2));
  }
})();



