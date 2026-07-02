const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://bbtejqjftzqawivkysyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidGVqcWpmdHpxYXdpdmt5c3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU2MjkyMywiZXhwIjoyMDk4MTM4OTIzfQ.ipr1gVyW71Q4Ke_-3RmjCz_L7usyxuc9UwwMjk1yKTc'
);

(async () => {
  try {
    console.log("Listing buckets...");
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error("List buckets error:", listError);
    } else {
      console.log("Existing buckets:", buckets.map(b => b.name));
    }

    // Try creating a test bucket or using profile-photos
    console.log("Checking / creating profile-photos bucket...");
    const exists = buckets?.some(b => b.name === 'profile-photos');
    if (!exists) {
      const { data, error: createError } = await supabase.storage.createBucket('profile-photos', { public: false });
      if (createError) {
        console.error("Create bucket error:", createError);
      } else {
        console.log("Created profile-photos bucket successfully");
      }
    }

    // Try uploading a small test file
    console.log("Uploading test file...");
    const buffer = Buffer.from("test file content");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload('test-user/test.txt', buffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    } else {
      console.log("Upload success:", uploadData);
      
      console.log("Generating signed URL...");
      const { data: signedData, error: signedError } = await supabase.storage
        .from('profile-photos')
        .createSignedUrl('test-user/test.txt', 60);
      
      if (signedError) {
        console.error("Signed URL error:", signedError);
      } else {
        console.log("Signed URL:", signedData.signedUrl);
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
})();
