-- Production cleanup and permanent Samuel bootstrap
-- Run this in Supabase SQL Editor with the service role.
-- This script keeps only Samuel Samura's account, removes seeded demo/test data,
-- and bootstraps his permanent NUKaFs-000001 membership identity.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure membership identity metadata exists
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
VALUES
  ('student_membership_counter', '{"next": 1}'::jsonb),
  ('stakeholder_membership_counter', '{"next": 1}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add expected identity columns to the app users table if missing
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

DO $$
DECLARE
  samuel_id UUID;
  samuel_email TEXT := 'samuel540wisesamura@gmail.com';
  samuel_full_name TEXT := 'Samuel Samura';
  demo_emails TEXT[] := ARRAY[
    'demo.student@nukafs.org',
    'demo.executive@nukafs.org',
    'demo.admin@nukafs.org',
    'demo.stakeholder@nukafs.org',
    'demo.superadmin@nukafs.org'
  ];
  vtoken TEXT;
  vurl TEXT;
BEGIN
  SELECT id INTO samuel_id
  FROM auth.users
  WHERE email = samuel_email
     OR (raw_user_meta_data->>'full_name') = samuel_full_name
  LIMIT 1;

  IF samuel_id IS NULL THEN
    RAISE NOTICE 'Samuel auth user not found. Create him first in Supabase Auth before running this script.';
    RETURN;
  END IF;

  -- Remove seeded demo and placeholder data from application tables
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'profiles'
  ) THEN
    DELETE FROM profiles
    WHERE id != samuel_id
       OR email = ANY(demo_emails)
       OR is_demo IS TRUE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'students'
  ) THEN
    DELETE FROM students;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'team_members'
  ) THEN
    DELETE FROM team_members;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'registrations'
  ) THEN
    DELETE FROM registrations;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'announcements'
  ) THEN
    DELETE FROM announcements;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'edit_requests'
  ) THEN
    DELETE FROM edit_requests;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'users'
  ) THEN
    DELETE FROM users
    WHERE id != samuel_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'membership_identities'
  ) THEN
    DELETE FROM membership_identities
    WHERE user_id != samuel_id;
  END IF;

  -- Remove all other auth users; keep only Samuel.
  DELETE FROM auth.users
  WHERE id != samuel_id;

  -- Bootstrap Samuel as a permanent member
  vtoken := encode(gen_random_bytes(32), 'hex');
  vurl := 'https://nukafs.vercel.app/verify/' || vtoken;

  INSERT INTO membership_identities (
    user_id,
    membership_id,
    membership_type,
    verification_token,
    verification_url,
    qr_code_data,
    qr_code_status,
    created_at,
    updated_at
  )
  SELECT samuel_id, 'NUKaFs-000001', 'student', vtoken, vurl, vurl, 'active', now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM membership_identities
    WHERE user_id = samuel_id OR membership_id = 'NUKaFs-000001'
  );

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'users'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM users WHERE id = samuel_id
    ) THEN
      INSERT INTO users (
        id,
        full_name,
        email,
        phone,
        role,
        status,
        profile_completion,
        membership_number,
        membership_type,
        membership_status,
        verification_status,
        account_status,
        password_change_required,
        membership_sequence,
        qr_code,
        qr_code_status,
        permanent_qr_code,
        date_issued,
        joined_date,
        is_migrated_to_digital_registry,
        legacy_membership_history,
        created_at,
        updated_at
      ) VALUES (
        samuel_id,
        samuel_full_name,
        samuel_email,
        '+23279630777',
        'super_admin',
        'active',
        100,
        'NUKaFs-000001',
        'Student',
        'active',
        'Verified',
        'Approved',
        true,
        1,
        vurl,
        'active',
        vurl,
        CURRENT_DATE,
        CURRENT_DATE,
        true,
        'Bootstrapped Samuel Samura as first permanent member',
        now(),
        now()
      );
    ELSE
      UPDATE users
      SET
        full_name = samuel_full_name,
        email = samuel_email,
        phone = '+23279630777',
        role = 'super_admin',
        status = 'active',
        profile_completion = 100,
        membership_number = 'NUKaFs-000001',
        membership_type = 'Student',
        membership_status = 'active',
        verification_status = 'Verified',
        account_status = 'Approved',
        password_change_required = true,
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
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'profiles'
  ) THEN
    UPDATE profiles
    SET
      email = samuel_email,
      full_name = samuel_full_name,
      phone = '+23279630777',
      role = 'super_admin',
      status = 'active',
      membership_id = 'NUKaFs-000001',
      membership_qr_data = vurl,
      date_issued = CURRENT_DATE,
      is_demo = false
    WHERE id = samuel_id;
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'full_name', samuel_full_name,
    'phone', '+23279630777',
    'role', 'super_admin',
    'status', 'active',
    'profile_completion', 100,
    'password_change_required', true,
    'membership_type', 'Student',
    'membership_status', 'active',
    'verification_status', 'Verified',
    'account_status', 'Approved'
  )
  WHERE id = samuel_id;

  INSERT INTO system_config (key, value)
  VALUES
    ('student_membership_counter', '{"next": 2}'::jsonb),
    ('stakeholder_membership_counter', '{"next": 1}'::jsonb)
  ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'audit_logs'
  ) THEN
    INSERT INTO audit_logs (
      actor_id,
      actor_name,
      action,
      target_entity,
      target_id,
      type,
      module,
      status,
      ip_address,
      created_at
    ) VALUES (
      samuel_id,
      samuel_full_name,
      'bootstrapped super admin profile',
      'membership_identities',
      'NUKaFs-000001',
      'other',
      'Membership',
      'success',
      NULL,
      now()
    );
  END IF;
END $$;

-- Final sanity checks
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_remaining,
  (SELECT COUNT(*) FROM users WHERE EXISTS (
      SELECT 1 FROM auth.users au WHERE au.id = users.id
    )) AS app_users_remaining,
  (SELECT COUNT(*) FROM membership_identities) AS membership_identities_remaining;

SELECT
  id,
  email,
  raw_user_meta_data
FROM auth.users
WHERE email = 'samuel540wisesamura@gmail.com';

SELECT
  id,
  full_name,
  email,
  role,
  membership_number,
  password_change_required
FROM users
WHERE id IN (SELECT id FROM auth.users WHERE email = 'samuel540wisesamura@gmail.com');
