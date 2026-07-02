-- Samuel Samura bootstrap SQL
-- Run this in Supabase SQL Editor after your app's users table and auth users exist.
-- This script updates Samuel's profile, membership identity, and role-related metadata.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO system_config (key, value)
VALUES ('student_membership_counter', '{"next": 1}'::jsonb), ('stakeholder_membership_counter', '{"next": 1}'::jsonb)
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_sequence INTEGER;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS permanent_qr_code TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS dob TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS town TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS home_address TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS current_address TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS campus TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS admission_year TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS biography TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_date TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS date_issued TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_status TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_migrated_to_digital_registry BOOLEAN;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS legacy_membership_history TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_color TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS scholarship_applicant BOOLEAN;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_status TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[];
    ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_skill TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS additional_skills TEXT[];
  END IF;
END $$;

-- Create membership identity record if it does not exist
DO $$
DECLARE
  samuel_id UUID;
  vtoken TEXT;
  vurl TEXT;
BEGIN
  SELECT id INTO samuel_id
  FROM auth.users
  WHERE email = 'samuel540wisesamura@gmail.com'
     OR (raw_user_meta_data->>'full_name') = 'Samuel Samura'
  LIMIT 1;

  IF samuel_id IS NULL THEN
    RAISE NOTICE 'Samuel auth user not found; create him in Supabase Auth first.';
  ELSE
    vtoken := encode(gen_random_bytes(32), 'hex');
    vurl := 'https://registry.nukafs-sl.org/verify/' || vtoken;

    INSERT INTO membership_identities (user_id, membership_id, membership_type, verification_token, verification_url, qr_code_data, qr_code_status, created_at, updated_at)
    SELECT samuel_id, 'NUKaFs-000001', 'student', vtoken, vurl, vurl, 'active', now(), now()
    WHERE NOT EXISTS (
      SELECT 1 FROM membership_identities WHERE user_id = samuel_id OR membership_id = 'NUKaFs-000001'
    );

    -- Update the app users row with the core identity fields
    UPDATE users
    SET
      full_name = 'Samuel Samura',
      email = 'samuel540wisesamura@gmail.com',
      phone = '+23279630777',
      role = 'super_admin',
      status = 'active',
      profile_completion = 100,
      membership_number = 'NUKaFs-000001',
      membership_type = 'Student',
      membership_status = 'active',
      verification_status = 'Verified',
      account_status = 'Approved',
      password_change_required = false,
      membership_sequence = 1,
      qr_code = vurl,
      qr_code_status = 'active',
      permanent_qr_code = vurl,
      date_issued = CURRENT_DATE,
      joined_date = CURRENT_DATE,
      is_migrated_to_digital_registry = true,
      legacy_membership_history = 'Bootstrapped Samuel Samura as first permanent member',
      updated_at = now()
    WHERE id = samuel_id;

    -- Optional: update auth metadata if your Supabase SQL role can write it
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'full_name', 'Samuel Samura',
      'phone', '+23279630777',
      'role', 'super_admin',
      'status', 'active',
      'profile_completion', 100,
      'password_change_required', false,
      'membership_type', 'Student',
      'membership_status', 'active',
      'verification_status', 'Verified',
      'account_status', 'Approved',
      'university', 'Fourah Bay College',
      'faculty', 'Engineering',
      'department', 'Electrical and Electronics Engineering',
      'course', 'Electrical and Electronics Engineering',
      'level', 'Year 4'
    )
    WHERE id = samuel_id;

    INSERT INTO system_config (key, value)
    VALUES ('student_membership_counter', '{"next": 2}'::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

    INSERT INTO system_config (key, value)
    VALUES ('stakeholder_membership_counter', '{"next": 1}'::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = 'audit_logs'
    ) THEN
      INSERT INTO audit_logs (actor_id, actor_name, action, target, type, module, status, ip, created_at)
      VALUES (
        samuel_id,
        'Samuel Samura',
        'bootstrapped super admin profile',
        'NUKaFs-000001',
        'system',
        'Membership',
        'success',
        'BOOTSTRAP',
        now()
      );
    END IF;
  END IF;
END $$;

-- Verify the result
SELECT 'membership_identities' AS table_name, mi.membership_id, mi.verification_url, u.email
FROM membership_identities mi
LEFT JOIN auth.users u ON u.id = mi.user_id
WHERE mi.membership_id = 'NUKaFs-000001';

SELECT 'users' AS table_name, full_name, email, role, membership_number, verification_status, qr_code
FROM users
WHERE email = 'samuel540wisesamura@gmail.com';
