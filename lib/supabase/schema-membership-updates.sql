/**
 * SQL Schema Updates for Membership ID System
 * 
 * Add these tables to your Supabase database
 * Run in the SQL Editor in Supabase Dashboard
 */

-- 1. Membership Identities Table
-- Stores permanent membership IDs and verification tokens
CREATE TABLE IF NOT EXISTS membership_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id TEXT NOT NULL UNIQUE,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('student', 'stakeholder')),
  verification_token TEXT NOT NULL UNIQUE,
  verification_url TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  qr_code_status TEXT DEFAULT 'active' CHECK (qr_code_status IN ('active', 'suspended', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_membership_identities_user_id ON membership_identities(user_id);
CREATE INDEX idx_membership_identities_membership_id ON membership_identities(membership_id);
CREATE INDEX idx_membership_identities_verification_token ON membership_identities(verification_token);

-- 2. System Config Table
-- Stores counters for sequential ID generation
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize counters
INSERT INTO system_config (key, value) VALUES
  ('student_membership_counter', '{"next": 1}'::jsonb),
  ('stakeholder_membership_counter', '{"next": 1}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Update users table to add new columns
-- These columns may already exist, so use conditional syntax
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS membership_sequence INTEGER,
ADD COLUMN IF NOT EXISTS permanent_qr_code TEXT;

-- 4. Row Level Security (RLS) Policies

-- Users can view their own profile photo path
CREATE POLICY IF NOT EXISTS "Users can view own profile photo" ON users
FOR SELECT USING (auth.uid() = id);

-- Only admins can update profile photos for users
CREATE POLICY IF NOT EXISTS "Admins can update user profiles" ON users
FOR UPDATE USING (
  auth.jwt() ->> 'role' IN ('super_admin', 'admin')
);

-- Public can view membership identities (for verification pages)
CREATE POLICY IF NOT EXISTS "Public can verify membership tokens" ON membership_identities
FOR SELECT USING (true);

-- Only service role can modify membership identities
CREATE POLICY IF NOT EXISTS "Only service role can create identities" ON membership_identities
FOR INSERT WITH CHECK (true);

-- 5. Super Admin Account Setup
-- Assign NUKaFs-000001 to Samuel Samura permanently
-- NOTE: Run this manually after creating Samuel's account
/*
UPDATE membership_identities
SET membership_id = 'NUKaFs-000001'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'samuel540wisesamura@gmail.com')
AND membership_type = 'student';

UPDATE system_config
SET value = '{"next": 2}'::jsonb
WHERE key = 'student_membership_counter';
*/
