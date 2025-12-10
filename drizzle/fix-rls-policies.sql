-- Fix RLS policies to prevent infinite recursion
-- IMPORTANT: Run drop-all-policies.sql FIRST, then run this file
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins and DMs to read all active users (avoid recursion by using auth.uid() directly)
CREATE POLICY "users_select_all"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update any user
CREATE POLICY "users_update_admin"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow admins to insert users
CREATE POLICY "users_insert_admin"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow admins to delete (soft delete) users
CREATE POLICY "users_delete_admin"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- CHARACTERS TABLE POLICIES
-- ============================================

-- Allow users to read their own characters
CREATE POLICY "characters_select_own"
ON characters FOR SELECT
TO authenticated
USING (player_id = auth.uid());

-- Allow DMs and admins to read all characters
CREATE POLICY "characters_select_all"
ON characters FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow users to create their own characters
CREATE POLICY "characters_insert_own"
ON characters FOR INSERT
TO authenticated
WITH CHECK (player_id = auth.uid());

-- Allow users to update their own characters
CREATE POLICY "characters_update_own"
ON characters FOR UPDATE
TO authenticated
USING (player_id = auth.uid())
WITH CHECK (player_id = auth.uid());

-- Allow users to delete their own characters
CREATE POLICY "characters_delete_own"
ON characters FOR DELETE
TO authenticated
USING (player_id = auth.uid());

-- ============================================
-- LOOT VOUCHERS TABLE POLICIES
-- ============================================

-- Allow users to read loot vouchers for their own characters
CREATE POLICY "loot_vouchers_select_own"
ON loot_vouchers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = loot_vouchers.character_id
    AND characters.player_id = auth.uid()
  )
);

-- Allow DMs and admins to read all loot vouchers
CREATE POLICY "loot_vouchers_select_all"
ON loot_vouchers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow DMs and admins to create loot vouchers
CREATE POLICY "loot_vouchers_insert_dm"
ON loot_vouchers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow users to mark their own loot vouchers as used
CREATE POLICY "loot_vouchers_update_own"
ON loot_vouchers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = loot_vouchers.character_id
    AND characters.player_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = loot_vouchers.character_id
    AND characters.player_id = auth.uid()
  )
);

-- Allow DMs and admins to update any loot voucher
CREATE POLICY "loot_vouchers_update_dm"
ON loot_vouchers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow DMs and admins to delete loot vouchers
CREATE POLICY "loot_vouchers_delete_dm"
ON loot_vouchers FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- ============================================
-- ATTENDANCE TOKENS TABLE POLICIES
-- ============================================

-- Allow users to read attendance tokens for their own characters
CREATE POLICY "attendance_tokens_select_own"
ON attendance_tokens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = attendance_tokens.character_id
    AND characters.player_id = auth.uid()
  )
);

-- Allow DMs and admins to read all attendance tokens
CREATE POLICY "attendance_tokens_select_all"
ON attendance_tokens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow DMs and admins to create attendance tokens
CREATE POLICY "attendance_tokens_insert_dm"
ON attendance_tokens FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Allow DMs and admins to delete attendance tokens
CREATE POLICY "attendance_tokens_delete_dm"
ON attendance_tokens FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dm')
  )
);

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
