# Supabase Setup Guide

This guide will help you set up Supabase for the D&D Adventure League Tracker application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose your organization
4. Fill in:
   - **Name**: `al-tracker` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier works great for POC

5. Click "Create new project" and wait for setup to complete (~2 minutes)

## Step 2: Get Your Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Find and copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** → **URI**
5. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

## Step 4: Run Database Migrations

The database schema is defined in `drizzle/schema.ts` using Drizzle ORM.

### Option A: Push Schema Directly (Recommended for Development)

```bash
npm run db:push
```

This will create all tables, enums, and relationships in your Supabase database.

### Option B: Generate and Run Migrations (Production Approach)

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Step 5: Set Up Row Level Security (RLS)

Supabase uses PostgreSQL Row Level Security for data protection. Run these SQL commands in the **SQL Editor** in your Supabase dashboard:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_tokens ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all active users"
  ON users FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can do anything with users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Characters table policies
CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING (
    player_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'dm' OR role = 'admin')
    )
  );

CREATE POLICY "Users can create own characters"
  ON characters FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (player_id = auth.uid());

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (player_id = auth.uid());

-- Loot vouchers policies
CREATE POLICY "Users can view loot for own characters"
  ON loot_vouchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = loot_vouchers.character_id
      AND characters.player_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'dm' OR role = 'admin')
    )
  );

CREATE POLICY "DMs and Admins can create loot vouchers"
  ON loot_vouchers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'dm' OR role = 'admin')
    )
  );

CREATE POLICY "Players can mark own loot as used"
  ON loot_vouchers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = loot_vouchers.character_id
      AND characters.player_id = auth.uid()
    )
  );

-- Attendance tokens policies
CREATE POLICY "Users can view attendance for own characters"
  ON attendance_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = attendance_tokens.character_id
      AND characters.player_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'dm' OR role = 'admin')
    )
  );

CREATE POLICY "DMs and Admins can create attendance tokens"
  ON attendance_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'dm' OR role = 'admin')
    )
  );
```

## Step 6: Seed the Database with Fixture Data

```bash
npm run db:seed
```

This will create the test users and sample characters, loot, and attendance data.

## Step 7: Set Up Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. Go to **Authentication** → **Email Templates**
4. Customize if desired

## Step 8: Test the Application

```bash
npm run dev
```

Open http://localhost:3000 and try logging in with:
- `admin@al.local` / password from seed script
- `dm@al.local` / password from seed script
- `player1@al.local` / password from seed script

## Database Management

### View Your Database

```bash
npm run db:studio
```

This opens Drizzle Studio to browse and edit your database.

### Alternative: Supabase Table Editor

Go to **Table Editor** in your Supabase dashboard to view and edit data.

## Troubleshooting

### Connection Issues

- Verify your `.env` file has correct credentials
- Check that your Supabase project is running
- Ensure DATABASE_URL password matches your database password

### Migration Errors

- If migrations fail, you can reset: Go to SQL Editor in Supabase and drop all tables
- Run `npm run db:push` again

### Authentication Errors

- Check Supabase Auth logs in **Authentication** → **Logs**
- Verify RLS policies are set up correctly
- Ensure user exists in both `auth.users` and `public.users` tables

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Review and test all RLS policies
- [ ] Set up email templates in Authentication
- [ ] Enable email confirmation
- [ ] Set up database backups (automatic in Supabase)
- [ ] Review API rate limits
- [ ] Set up monitoring and alerts
- [ ] Use environment variables for all secrets
- [ ] Enable SSL/TLS (automatic with Supabase)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
