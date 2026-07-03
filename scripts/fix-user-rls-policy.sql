-- Fix recursive RLS policy evaluation for users and membership identities
-- Run this in your Supabase SQL Editor with service role access.

-- Users can read all users only if they are super_admin
DROP POLICY IF EXISTS "users_select_all_admin" ON public.users;
CREATE POLICY "users_select_all_admin" ON public.users
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Users can read non-sensitive fields of other users when they are admin or executive
DROP POLICY IF EXISTS "users_select_partial" ON public.users;
CREATE POLICY "users_select_partial" ON public.users
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('super_admin', 'executive')
);

-- Admins can update any user profile
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
CREATE POLICY "users_update_admin" ON public.users
FOR UPDATE TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Admins can read all membership identities
DROP POLICY IF EXISTS "membership_identities_select_admin" ON public.membership_identities;
CREATE POLICY "membership_identities_select_admin" ON public.membership_identities
FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' = 'super_admin'
);
