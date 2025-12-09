# Vercel Deployment Guide

Complete guide for deploying the D&D Adventure League Tracker to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier works great)
- [GitHub Account](https://github.com) (for GitHub integration)
- Git repository pushed to GitHub
- Optional: Supabase project (if using database backend)

## Table of Contents

1. [Quick Deploy (localStorage Version)](#quick-deploy-localstorage-version)
2. [Deploy with Supabase Backend](#deploy-with-supabase-backend)
3. [Environment Variables](#environment-variables)
4. [Custom Domain Setup](#custom-domain-setup)
5. [Troubleshooting](#troubleshooting)

---

## Quick Deploy (localStorage Version)

The localStorage version requires **no database setup** and can be deployed in minutes!

### Step 1: Push to GitHub

```bash
# If not already done
git remote add origin https://github.com/YOUR_USERNAME/via-al-tracker.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository
5. Configure project:
   - **Framework Preset**: Nuxt.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.output/public` (auto-detected)

### Step 3: Environment Variables

For the localStorage version, **no environment variables are required**!

Click **"Deploy"** and you're done! 🎉

### Step 4: Access Your App

Once deployed (takes 2-3 minutes):
- Your app will be available at: `https://your-project.vercel.app`
- Test with the fixture users:
  - `admin@al.local` / `admin123`
  - `dm@al.local` / `dm123`
  - `player1@al.local` / `player123`

---

## Deploy with Supabase Backend

For a production-ready deployment with Supabase database.

### Prerequisites

1. **Complete Supabase Setup First**
   - Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Have your Supabase project ready
   - Database schema deployed
   - Users created in Supabase Auth

2. **Switch to Supabase Stores**
   - Follow [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
   - Rename store files to use Supabase versions
   - Test locally first!

### Step 1: Prepare for Deployment

```bash
# Ensure you're using Supabase stores
# The .supabase.ts files should be renamed to .ts

# Commit the changes
git add stores/
git commit -m "chore: Switch to Supabase stores for production"
git push origin main
```

### Step 2: Configure Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository (same as localStorage method)
3. **Before deploying**, add environment variables (next step)

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `DATABASE_URL` | Your Supabase database URL | Production |

**Where to find these:**
- **Supabase URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **Anon Key**: In Supabase Dashboard → Settings → API → anon/public key
- **Database URL**: In Supabase Dashboard → Settings → Database → Connection string (URI)

**Important**:
- Use the **Transaction** pooling mode connection string for Vercel
- Replace `[YOUR-PASSWORD]` with your actual database password
- The anon key is safe to use client-side (with RLS enabled)

### Step 4: Deploy

Click **"Deploy"** in Vercel.

The deployment will:
1. Install dependencies
2. Build the Nuxt app
3. Deploy to Vercel's edge network
4. Set up automatic deployments for future pushes

### Step 5: Verify Deployment

1. Visit your Vercel URL
2. Try logging in with a Supabase Auth user
3. Test character creation
4. Verify DM and Admin features

---

## Environment Variables Reference

### Required for Supabase Deployment

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Optional Environment Variables

```env
# Application Settings
NODE_ENV=production

# Custom Domain (if using)
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Setting Environment Variables in Vercel

**Via Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add each variable with its value
3. Select which environments to apply to (Production, Preview, Development)
4. Click "Save"

**Via Vercel CLI:**
```bash
vercel env add SUPABASE_URL production
# Enter value when prompted

vercel env add SUPABASE_ANON_KEY production
# Enter value when prompted

vercel env add DATABASE_URL production
# Enter value when prompted
```

---

## Deployment Scenarios

### Scenario 1: localStorage Only (No Backend)

**Pros:**
- ✅ Instant deployment
- ✅ No database setup
- ✅ No environment variables needed
- ✅ Perfect for demos/testing

**Cons:**
- ❌ Data not shared between users
- ❌ No persistence across devices
- ❌ Not suitable for production

**Best for:** POC, demos, portfolio projects

### Scenario 2: Supabase Backend (Full Production)

**Pros:**
- ✅ Real database
- ✅ Secure authentication
- ✅ Data persistence
- ✅ Multi-user support
- ✅ Production-ready

**Cons:**
- ⚠️ Requires Supabase setup
- ⚠️ Environment variables needed
- ⚠️ Slightly more complex

**Best for:** Production deployments, real usage

---

## Custom Domain Setup

### Step 1: Add Domain to Vercel

1. Go to your project → Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `al-tracker.yourdomain.com`)
4. Follow Vercel's DNS instructions

### Step 2: Configure DNS

Add these records to your domain's DNS:

**For subdomain:**
```
Type: CNAME
Name: al-tracker (or your subdomain)
Value: cname.vercel-dns.com
```

**For apex domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: Verify

- Vercel will automatically issue SSL certificate
- Wait for DNS propagation (can take up to 24 hours)
- Your app will be accessible at your custom domain

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to any branch** → Preview deployment
- **Pull Request** → Preview deployment with unique URL

### Deployment Workflow

```bash
# Make changes
git add .
git commit -m "feat: Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs build
# 3. Deploys to production
# 4. Sends notification
```

---

## Build Configuration

The project uses these Nuxt build settings optimized for Vercel:

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel' // Auto-detected by Vercel
  },
  // ... other config
})
```

No additional configuration needed!

---

## Performance Optimization

### Vercel Automatically Provides:

- **Edge Network**: Global CDN
- **Smart Caching**: Automatic asset caching
- **Image Optimization**: Built-in image optimization
- **Compression**: Gzip/Brotli compression
- **HTTP/2 & HTTP/3**: Modern protocols

### Additional Optimizations:

1. **Enable Analytics**
   - Go to project → Analytics
   - Enable Web Analytics (free)
   - Monitor performance metrics

2. **Configure Caching Headers**
   ```javascript
   // nuxt.config.ts
   nitro: {
     routeRules: {
       '/': { isr: 60 }, // Cache for 60 seconds
       '/api/**': { cache: { maxAge: 10 } }
     }
   }
   ```

---

## Monitoring & Logs

### View Deployment Logs

1. Go to Deployments tab
2. Click on any deployment
3. View build logs and runtime logs

### Enable Logging

Vercel automatically captures:
- Build logs
- Function logs (if using serverless)
- Error logs

View logs in real-time:
```bash
vercel logs your-project.vercel.app
```

---

## Troubleshooting

### Build Fails

**Error: "Build exceeded maximum duration"**
- **Solution**: Optimize dependencies, reduce build size
- Check for large packages in `node_modules`

**Error: "Module not found"**
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally first
- Check for missing imports

**Error: "Environment variable not set"**
- **Solution**: Add environment variables in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Error: "Failed to fetch from Supabase"**
- **Check**: Environment variables are set correctly
- **Check**: Supabase project is running
- **Check**: RLS policies allow access
- **Check**: Database URL uses pooler mode (`:6543`)

**Error: "Authentication failed"**
- **Check**: User exists in Supabase Auth
- **Check**: User profile exists in `users` table
- **Check**: Supabase anon key is correct

**Error: "CORS error"**
- **Solution**: Add your Vercel URL to Supabase allowed origins
- Go to Supabase → Authentication → URL Configuration
- Add `https://your-project.vercel.app`

### Performance Issues

**Slow initial load**
- Enable Vercel Analytics to identify bottlenecks
- Check Supabase query performance
- Consider adding indexes to database

**Cold start delays**
- Normal for serverless functions
- Consider using Vercel Pro for faster cold starts
- Use static generation where possible

---

## Vercel CLI Deployment

Alternative to GitHub integration:

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Set Environment Variables

```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add DATABASE_URL production
```

---

## Production Checklist

Before deploying to production with Supabase:

- [ ] Supabase project created and configured
- [ ] Database schema deployed (`npm run db:push`)
- [ ] RLS policies set up correctly
- [ ] Test users created in Supabase Auth
- [ ] Environment variables added to Vercel
- [ ] Supabase stores activated (`.supabase.ts` renamed to `.ts`)
- [ ] Tested locally with Supabase
- [ ] Custom domain configured (optional)
- [ ] Vercel project linked to GitHub repository
- [ ] Deployment successful and tested
- [ ] All user roles tested (admin, dm, player)
- [ ] Character creation/management tested
- [ ] Loot voucher awarding tested
- [ ] Attendance tracking tested

---

## Cost Considerations

### Free Tier Limits (Vercel)

- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours compute/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Unlimited deployments

**Perfect for this POC!** You won't exceed limits with normal usage.

### Free Tier Limits (Supabase)

- ✅ 500 MB database
- ✅ 1 GB bandwidth/month
- ✅ 50 MB file storage
- ✅ 50,000 monthly active users

**More than enough for this application!**

---

## Updating Deployment

### Update via Git Push

```bash
# Make changes
git add .
git commit -m "Update: feature description"
git push origin main

# Vercel automatically redeploys
```

### Rollback Deployment

1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click three dots → "Promote to Production"
4. Previous version is restored instantly

---

## Next Steps After Deployment

1. **Share Your App**: Send the Vercel URL to users
2. **Monitor Usage**: Check Vercel Analytics
3. **Gather Feedback**: Test with real D&D groups
4. **Iterate**: Push updates as needed
5. **Scale Up**: Upgrade Vercel/Supabase plans if needed

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Nuxt Deployment Guide**: https://nuxt.com/docs/getting-started/deployment#vercel
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **Project Issues**: Create an issue in your GitHub repo

---

## Summary

**For Quick Demo (localStorage):**
```bash
git push origin main
# Import to Vercel → Deploy (done!)
```

**For Production (Supabase):**
```bash
# 1. Setup Supabase
npm run db:push
npm run db:seed

# 2. Switch stores
mv stores/*.supabase.ts stores/*.ts

# 3. Push to GitHub
git push origin main

# 4. Configure Vercel environment variables
# 5. Deploy!
```

Your D&D Adventure League Tracker is now live on Vercel! 🚀🎲

---

**Pro Tip**: Start with the localStorage version for quick testing, then migrate to Supabase when ready for production use.
