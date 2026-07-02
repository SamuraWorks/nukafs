const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
(async()=>{
  const userId = '76c88027-9240-478a-94f4-a6eaf2576c2f';
  const { data, error } = await supabase.from('users').select('id, full_name, phone, university, faculty, department, course, level, student_id, occupation, biography, emergency_contact, employment_status, profile_photo_url, profile_photo').eq('id', userId).single();
  console.log('db profile', JSON.stringify({ error, data }, null, 2));
})();
