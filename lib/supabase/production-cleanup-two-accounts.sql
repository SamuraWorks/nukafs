-- Production cleanup: keep only two authorized accounts (Samuel + Greenshift)
-- Run this in the Supabase SQL Editor with the service role (or via psql using service role credentials).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure membership_identities and system_config exist
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

-- Main cleanup and bootstrap block
DO $$
DECLARE
  samuel_email TEXT := 'samuel540wisesamura@gmail.com';
  greenshift_email TEXT := 'greenshift.sl@gmail.com';
  samuel_id UUID;
  greenshift_id UUID;
  vtoken TEXT;
  vurl TEXT;
  origin TEXT := 'https://nukafs.vercel.app';
BEGIN
  -- Find auth user IDs
  SELECT id INTO samuel_id FROM auth.users WHERE email = samuel_email LIMIT 1;
  SELECT id INTO greenshift_id FROM auth.users WHERE email = greenshift_email LIMIT 1;

  IF samuel_id IS NULL OR greenshift_id IS NULL THEN
    RAISE NOTICE 'One or both auth users not found. Create both auth users first (emails: %, %). Aborting.', samuel_email, greenshift_email;
    RETURN;
  END IF;

  -- profiles table may not exist; skip if absent
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'profiles') THEN
    DELETE FROM profiles
    WHERE id NOT IN (samuel_id, greenshift_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'students') THEN
    DELETE FROM students WHERE id NOT IN (samuel_id, greenshift_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'team_members') THEN
    DELETE FROM team_members WHERE id NOT IN (samuel_id, greenshift_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'registrations') THEN
    DELETE FROM registrations WHERE user_id NOT IN (samuel_id, greenshift_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'announcements') THEN
    -- announcements table uses `published_by` to reference the author
    DELETE FROM announcements WHERE published_by NOT IN (samuel_id, greenshift_id);
  END IF;

  -- edit_requests may not exist or may have different column names
  -- Skip if table doesn't exist; if it exists with user_id column, filter by that
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'edit_requests') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'edit_requests' AND column_name = 'user_id') THEN
      DELETE FROM edit_requests WHERE user_id NOT IN (samuel_id, greenshift_id);
    END IF;
  END IF;

  -- Trim membership_identities to only the two accounts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'membership_identities') THEN
    DELETE FROM membership_identities WHERE user_id NOT IN (samuel_id, greenshift_id);
  END IF;

  -- Keep only the two app users (public.users) if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'users') THEN
    DELETE FROM users WHERE id NOT IN (samuel_id, greenshift_id);
  END IF;

  -- Remove other auth users; keep only the two
  DELETE FROM auth.users WHERE id NOT IN (samuel_id, greenshift_id);

  -- Bootstrap membership identities for Samuel (000001) and Greenshift (000002)
  -- Samuel
  vtoken := encode(gen_random_bytes(32), 'hex');
  vurl := origin || '/verify/' || vtoken;

  INSERT INTO membership_identities (user_id, membership_id, membership_type, verification_token, verification_url, qr_code_data, qr_code_status, created_at, updated_at)
  SELECT samuel_id, 'NUKaFs-000001', 'student', vtoken, vurl, vurl, 'active', now(), now()
  WHERE NOT EXISTS (SELECT 1 FROM membership_identities WHERE user_id = samuel_id OR membership_id = 'NUKaFs-000001');

  -- Greenshift
  vtoken := encode(gen_random_bytes(32), 'hex');
  vurl := origin || '/verify/' || vtoken;

  INSERT INTO membership_identities (user_id, membership_id, membership_type, verification_token, verification_url, qr_code_data, qr_code_status, created_at, updated_at)
  SELECT greenshift_id, 'NUKaFs-000002', 'student', vtoken, vurl, vurl, 'active', now(), now()
  WHERE NOT EXISTS (SELECT 1 FROM membership_identities WHERE user_id = greenshift_id OR membership_id = 'NUKaFs-000002');

  -- Update or insert application users rows for both (public.users)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'users') THEN
    -- Samuel
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = samuel_id) THEN
      INSERT INTO users (id, full_name, email, role, status, profile_completion, membership_number, membership_type, membership_status, verification_status, account_status, membership_sequence, qr_code, qr_code_status, permanent_qr_code, date_issued, joined_date, created_at, updated_at)
      VALUES (samuel_id, 'Samuel Samura', samuel_email, 'super_admin', 'active', 100, 'NUKaFs-000001', 'Student', 'active', 'Verified', 'Approved', 1, (SELECT qr_code_data FROM membership_identities WHERE user_id = samuel_id), 'active', (SELECT qr_code_data FROM membership_identities WHERE user_id = samuel_id), CURRENT_DATE, CURRENT_DATE, now(), now());
    ELSE
      UPDATE users SET
        full_name = 'Samuel Samura',
        email = samuel_email,
        role = 'super_admin',
        status = 'active',
        profile_completion = 100,
        membership_number = 'NUKaFs-000001',
        membership_type = 'Student',
        membership_status = 'active',
        verification_status = 'Verified',
        account_status = 'Approved',
        membership_sequence = 1,
        qr_code = (SELECT qr_code_data FROM membership_identities WHERE user_id = samuel_id),
        qr_code_status = 'active',
        permanent_qr_code = (SELECT qr_code_data FROM membership_identities WHERE user_id = samuel_id),
        date_issued = CURRENT_DATE,
        joined_date = CURRENT_DATE,
        updated_at = now()
      WHERE id = samuel_id;
    END IF;

    -- Greenshift
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = greenshift_id) THEN
      INSERT INTO users (id, full_name, email, role, status, profile_completion, membership_number, membership_type, membership_status, verification_status, account_status, membership_sequence, qr_code, qr_code_status, permanent_qr_code, date_issued, joined_date, created_at, updated_at)
      VALUES (greenshift_id, 'Greenshift Admin', greenshift_email, 'executive', 'active', 100, 'NUKaFs-000002', 'Student', 'active', 'Verified', 'Approved', 2, (SELECT qr_code_data FROM membership_identities WHERE user_id = greenshift_id), 'active', (SELECT qr_code_data FROM membership_identities WHERE user_id = greenshift_id), CURRENT_DATE, CURRENT_DATE, now(), now());
    ELSE
      UPDATE users SET
        full_name = 'Greenshift Admin',
        email = greenshift_email,
        role = 'executive',
        status = 'active',
        profile_completion = 100,
        membership_number = 'NUKaFs-000002',
        membership_type = 'Student',
        membership_status = 'active',
        verification_status = 'Verified',
        account_status = 'Approved',
        membership_sequence = 2,
        qr_code = (SELECT qr_code_data FROM membership_identities WHERE user_id = greenshift_id),
        qr_code_status = 'active',
        permanent_qr_code = (SELECT qr_code_data FROM membership_identities WHERE user_id = greenshift_id),
        date_issued = CURRENT_DATE,
        joined_date = CURRENT_DATE,
        updated_at = now()
      WHERE id = greenshift_id;
    END IF;
  END IF;

  -- Update auth.users metadata for both users to reflect role and status
  UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'super_admin',
    'status', 'active',
    'membership_type', 'Student',
    'membership_status', 'active',
    'verification_status', 'Verified'
  ) WHERE id = samuel_id;

  UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'executive',
    'status', 'active',
    'membership_type', 'Student',
    'membership_status', 'active',
    'verification_status', 'Verified'
  ) WHERE id = greenshift_id;

  -- Ensure system counter resumes at next = 3 (next allocation will produce 000003)
  INSERT INTO system_config (key, value) VALUES ('student_membership_counter', '{"next": 3}'::jsonb)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  -- Audit log entries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'audit_logs') THEN
    INSERT INTO audit_logs (actor_id, actor_name, action, target_entity, target_id, type, module, status, created_at)
    VALUES (samuel_id, 'Samuel Samura', 'bootstrapped two-account production reset', 'membership_identities', 'NUKaFs-000001,NUKaFs-000002', 'other', 'Membership', 'success', now());
  END IF;

END $$;

-- Final sanity checks (returns counts and members)
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_remaining,
  (SELECT COUNT(*) FROM users WHERE EXISTS (SELECT 1 FROM auth.users au WHERE au.id = users.id)) AS app_users_remaining,
  (SELECT COUNT(*) FROM membership_identities) AS membership_identities_remaining,
  (SELECT value FROM system_config WHERE key = 'student_membership_counter') AS student_counter;

SELECT id, email, raw_user_meta_data FROM auth.users WHERE email IN ('samuel540wisesamura@gmail.com','greenshift.sl@gmail.com');

SELECT id, full_name, email, role, membership_number, qr_code_status FROM users WHERE id IN (SELECT id FROM auth.users WHERE email IN ('samuel540wisesamura@gmail.com','greenshift.sl@gmail.com'));
