-- Drop ALL existing policies on all tables
-- Run this first to clean up

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on users table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;

    -- Drop all policies on characters table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'characters') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON characters';
    END LOOP;

    -- Drop all policies on loot_vouchers table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'loot_vouchers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON loot_vouchers';
    END LOOP;

    -- Drop all policies on attendance_tokens table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'attendance_tokens') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON attendance_tokens';
    END LOOP;
END $$;
