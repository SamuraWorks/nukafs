-- Run this script in the Supabase SQL Editor to add the missing profile fields

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS expected_graduation_year TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Verify the columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';
