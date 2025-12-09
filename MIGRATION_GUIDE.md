# Migration Guide: localStorage to Supabase

This guide explains how to migrate the D&D Adventure League Tracker from localStorage to Supabase backend.

## Current Status

The application now has **two versions of stores**:

### localStorage Version (Original - Currently Active)
- `stores/auth.ts`
- `stores/characters.ts`
- `stores/lootVouchers.ts`
- `stores/attendance.ts`

### Supabase Version (New - Ready to Use)
- `stores/auth.supabase.ts`
- `stores/characters.supabase.ts`
- `stores/lootVouchers.supabase.ts`
- `stores/attendance.supabase.ts`

## Quick Start: Switch to Supabase

### Step 1: Set Up Supabase Project

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
1. Create a Supabase project
2. Get your credentials
3. Configure environment variables

### Step 2: Push Database Schema

```bash
# Push schema to Supabase
npm run db:push

# Or generate migrations
npm run db:generate
npm run db:migrate
```

### Step 3: Set Up Row Level Security

Run the RLS policies from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#step-5-set-up-row-level-security-rls) in your Supabase SQL Editor.

### Step 4: Seed the Database

```bash
npm run db:seed
```

**Important**: After seeding, you need to manually create the users in Supabase Auth:

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Create each user with:
   - Email: `admin@al.local`, `dm@al.local`, `player1@al.local`, etc.
   - Password: Your choice (e.g., `admin123`, `dm123`, `player123`)
   - Confirm email: ✓ (check this box)

The seed script creates user profiles in the database, but Supabase Auth users must be created separately.

### Step 5: Switch to Supabase Stores

**Option A: Rename Files (Recommended)**

```bash
# Backup localStorage stores
mv stores/auth.ts stores/auth.localStorage.ts
mv stores/characters.ts stores/characters.localStorage.ts
mv stores/lootVouchers.ts stores/lootVouchers.localStorage.ts
mv stores/attendance.ts stores/attendance.localStorage.ts

# Activate Supabase stores
mv stores/auth.supabase.ts stores/auth.ts
mv stores/characters.supabase.ts stores/characters.ts
mv stores/lootVouchers.supabase.ts stores/lootVouchers.ts
mv stores/attendance.supabase.ts stores/attendance.ts
```

**Option B: Manual File Replacement**

Copy the content from each `.supabase.ts` file to replace the corresponding `.ts` file.

### Step 6: Update app.vue Initialization

The Supabase stores use async initialization. Update your `app.vue`:

```vue
<script setup lang="ts">
onMounted(async () => {
  const authStore = useAuthStore()
  const charactersStore = useCharactersStore()
  const lootStore = useLootVouchersStore()
  const attendanceStore = useAttendanceStore()

  // Initialize with async calls for Supabase
  await authStore.initialize()
  await charactersStore.initialize()
  await lootStore.initialize()
  await attendanceStore.initialize()
})
</script>
```

### Step 7: Update Middleware (If Needed)

The Supabase auth middleware should work with minimal changes. The key difference is that `initialize()` is now async:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Initialize if not already done
  if (!authStore.supabaseUser) {
    await authStore.initialize()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath !== '/login' ? to.fullPath : undefined }
    })
  }
})
```

### Step 8: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and login with the Supabase Auth users you created!

## Key Differences Between Versions

### Authentication

**localStorage**: Mock authentication with plain-text passwords
```typescript
// Simple string comparison
if (user.password !== password) {
  return { success: false }
}
```

**Supabase**: Real authentication with Supabase Auth
```typescript
// Secure authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

### Data Persistence

**localStorage**: JSON stringify/parse
```typescript
localStorage.setItem('al_tracker_users', JSON.stringify(users))
```

**Supabase**: PostgreSQL with type-safe queries
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
```

### Real-time Capabilities

Supabase supports real-time subscriptions (optional):

```typescript
// Subscribe to character changes
supabase
  .channel('characters')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'characters' },
    (payload) => {
      // Handle real-time updates
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

## Rollback to localStorage

If you need to go back to localStorage:

```bash
# Restore localStorage stores
mv stores/auth.localStorage.ts stores/auth.ts
mv stores/characters.localStorage.ts stores/characters.ts
mv stores/lootVouchers.localStorage.ts stores/lootVouchers.ts
mv stores/attendance.localStorage.ts stores/attendance.ts

# Backup Supabase stores
mv stores/auth.ts stores/auth.supabase.ts
mv stores/characters.ts stores/characters.supabase.ts
mv stores/lootVouchers.ts stores/lootVouchers.supabase.ts
mv stores/attendance.ts stores/attendance.supabase.ts
```

## Testing Checklist

After switching to Supabase, test these scenarios:

- [ ] Login with each user type (admin, dm, player)
- [ ] Create a new character
- [ ] View character details
- [ ] Award loot voucher as DM
- [ ] Award attendance token as DM
- [ ] Mark loot as used
- [ ] Update user role as admin
- [ ] Search for characters
- [ ] Logout and login again

## Troubleshooting

### "User not found" Error
- Ensure you created the user in Supabase Auth (not just the database)
- Check that email matches exactly between Auth and database

### "Permission denied" Error
- Verify RLS policies are set up correctly
- Check that the user's role is correct in the database
- Test policies in Supabase SQL Editor

### Data Not Appearing
- Refresh the page after login
- Check browser console for errors
- Verify Supabase credentials in `.env`

### Slow Initial Load
- Supabase queries are async - this is normal
- Consider adding loading states
- Use Supabase Edge Functions for complex operations

## Production Considerations

Before deploying with Supabase:

1. **Security**
   - Review all RLS policies thoroughly
   - Never expose service_role key client-side
   - Use environment variables for all secrets
   - Enable email verification
   - Set up MFA for admin accounts

2. **Performance**
   - Add database indexes for frequently queried fields
   - Use Supabase Edge Functions for complex operations
   - Implement pagination for large lists
   - Consider caching strategies

3. **Monitoring**
   - Set up Supabase dashboard alerts
   - Monitor database size and connections
   - Track API usage and rate limits
   - Enable logging for debugging

4. **Backup**
   - Supabase provides automatic daily backups
   - Test restore procedures
   - Export critical data regularly
   - Document recovery procedures

## Next Steps

After successful migration:

1. Remove localStorage code (stores/*.localStorage.ts files)
2. Update CLAUDE.md with Supabase instructions
3. Add real-time features (optional)
4. Implement email verification
5. Add password reset functionality
6. Set up production environment

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Nuxt Supabase Module](https://supabase.nuxtjs.org) (alternative approach)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
