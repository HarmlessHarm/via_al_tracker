# Deployment Checklist

Quick reference checklist for deploying the D&D Adventure League Tracker.

## Pre-Deployment

### Choose Your Version

- [ ] **localStorage Version** - No setup, instant deploy (recommended for demos)
- [ ] **Supabase Version** - Production-ready database backend

---

## Option 1: localStorage Deployment (Quickest)

### ✅ Ready to Deploy Right Now!

**Steps:**
1. [ ] Push code to GitHub
2. [ ] Connect to Vercel
3. [ ] Click Deploy
4. [ ] Done! ✨

**Time Required:** 5 minutes

**No configuration needed!** The localStorage version works out of the box.

---

## Option 2: Supabase Deployment (Production)

### Before Deploying

#### Supabase Setup
- [ ] Create Supabase project
- [ ] Copy Supabase URL
- [ ] Copy Supabase anon key
- [ ] Copy database connection string
- [ ] Run `npm run db:push` to create tables
- [ ] Set up RLS policies (copy from SUPABASE_SETUP.md)
- [ ] Run `npm run db:seed` to add fixture data
- [ ] Create users in Supabase Auth
  - [ ] admin@al.local
  - [ ] dm@al.local
  - [ ] player1@al.local
  - [ ] player2@al.local

#### Local Testing
- [ ] Switch to Supabase stores (rename .supabase.ts files)
- [ ] Add credentials to `.env`
- [ ] Test locally with `npm run dev`
- [ ] Verify login works
- [ ] Verify character creation works
- [ ] Verify DM features work
- [ ] Verify admin features work

#### Code Changes
- [ ] Commit Supabase store changes
- [ ] Push to GitHub
- [ ] Verify no .env file in repo (should be in .gitignore)

### Vercel Configuration

#### Environment Variables
- [ ] Add `SUPABASE_URL` to Vercel
- [ ] Add `SUPABASE_ANON_KEY` to Vercel
- [ ] Add `DATABASE_URL` to Vercel
- [ ] Apply to Production, Preview, Development

#### Deploy
- [ ] Click Deploy in Vercel
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

### Post-Deployment Testing

#### Basic Tests
- [ ] Visit deployed URL
- [ ] Login as admin
- [ ] Login as DM
- [ ] Login as player
- [ ] Create a character
- [ ] Award loot (as DM)
- [ ] Award attendance (as DM)
- [ ] Mark loot as used
- [ ] Update user role (as admin)

#### Advanced Tests
- [ ] Test on mobile device
- [ ] Test on different browsers
- [ ] Test multiclass character creation
- [ ] Test search functionality
- [ ] Test navigation between pages
- [ ] Verify RLS is working (player can't see other players' data)

---

## Common Issues & Solutions

### Build Fails

**"Missing environment variables"**
- ✅ Add all three Supabase variables in Vercel settings
- ✅ Redeploy after adding

**"Type errors"**
- ✅ Run `npm run typecheck` locally first
- ✅ Fix type errors before deploying

### Runtime Errors

**"Failed to connect to Supabase"**
- ✅ Check environment variables are set correctly
- ✅ Verify Supabase project is active
- ✅ Check Supabase URL doesn't have trailing slash

**"Authentication failed"**
- ✅ Create user in Supabase Auth dashboard
- ✅ Verify email matches exactly
- ✅ Check user profile exists in users table

**"Permission denied"**
- ✅ Verify RLS policies are set up
- ✅ Check user role in database
- ✅ Test policies in Supabase SQL editor

---

## Rollback Plan

If deployment fails:

1. **Quick Fix:**
   - [ ] Go to Vercel Deployments
   - [ ] Find last working deployment
   - [ ] Click "Promote to Production"

2. **Code Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback:**
   - Supabase has automatic daily backups
   - Go to Database → Backups
   - Restore from backup if needed

---

## Production Readiness

### Security
- [ ] All RLS policies enabled and tested
- [ ] No sensitive data in code
- [ ] Environment variables properly configured
- [ ] HTTPS enabled (automatic with Vercel)

### Performance
- [ ] Test page load times
- [ ] Check Vercel Analytics
- [ ] Optimize images if needed
- [ ] Enable caching if needed

### Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (optional)
- [ ] Monitor Supabase usage

### Documentation
- [ ] Update README with deployed URL
- [ ] Document any custom configuration
- [ ] Create user guide (optional)

---

## Post-Deployment

### Share Your App
- [ ] Share Vercel URL with team
- [ ] Create demo accounts for testing
- [ ] Document test credentials (if sharing publicly)

### Maintenance
- [ ] Monitor deployment notifications
- [ ] Check Vercel/Supabase dashboards weekly
- [ ] Update dependencies monthly
- [ ] Backup data regularly

### Scaling
- [ ] Monitor Vercel bandwidth usage
- [ ] Monitor Supabase database size
- [ ] Upgrade plans if needed

---

## Quick Reference

### Vercel Dashboard
https://vercel.com/dashboard

### Supabase Dashboard
https://app.supabase.com

### Deployment Logs
Vercel Project → Deployments → [Latest] → Build Logs

### Environment Variables
Vercel Project → Settings → Environment Variables

### Domain Settings
Vercel Project → Settings → Domains

---

## Need Help?

- **Vercel Issues**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Supabase Issues**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **General Setup**: [README.md](./README.md)

---

**Pro Tip:** Start with localStorage deployment for quick testing, then migrate to Supabase when you're ready for real users!
