# Quick Start Guide - Deploy Leerbot in 15 Minutes

## Current Status ❌

Your app currently **won't work** on Netlify because:
- ✅ Frontend files are ready
- ❌ Backend API endpoints are missing
- ❌ Supabase database tables are not set up

## What You Need To Do

### Step 1: Set Up Supabase Database (10 minutes)

1. Go to your Supabase project: https://xxgebftpfslkucdkbila.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Open the `SUPABASE_SETUP.md` file
4. Copy and run all the table creation scripts
5. Enable Row Level Security (RLS) on all tables
6. Add the RLS policies from the guide

**Test it:** Go to "Table Editor" and verify all tables exist

### Step 2: Choose Your Backend Approach

You have 2 options:

#### Option A: Refactor to Pure Supabase (RECOMMENDED - No backend needed!)
**Time:** 1-2 hours of coding
**Difficulty:** Medium
**Result:** Fully working app with no backend deployment

**What to do:**
1. Replace all `fetch('/api/...')` calls with direct Supabase queries
2. Use the examples in `SUPABASE_SETUP.md`
3. Update these files:
   - `dashboard.js`
   - `lijst.js`
   - `oefen.js`
   - `ontdek.js`
   - `admin.js`

**Example transformation:**
```javascript
// Before (won't work):
const res = await fetch('/api?resource=lists')
const lists = await res.json()

// After (will work):
const { data: lists } = await supabase.from('lists').select('*')
```

#### Option B: Create Netlify Functions (ADVANCED)
**Time:** 3-4 hours
**Difficulty:** Hard
**Result:** Keep your current API structure

**What to do:**
1. Create `netlify/functions/` directory
2. Create a function file for each endpoint
3. Deploy backend logic as serverless functions
4. See Netlify Functions documentation

### Step 3: Deploy to Netlify (2 minutes)

**Easiest Way - Drag & Drop:**
1. Go to https://app.netlify.com/drop
2. Select all files from the outputs folder
3. Drag and drop them into the upload area
4. Done! Your site is live

**Better Way - Git Deploy:**
1. Create a GitHub repository
2. Push all files to the repository
3. Go to Netlify → "Add new site" → "Import from Git"
4. Select your repository
5. Click "Deploy site"

### Step 4: Set Environment Variables in Netlify

1. Go to your site settings in Netlify
2. Navigate to "Environment variables"
3. Add these variables:
   - `SUPABASE_URL` = `https://xxgebftpfslkucdkbila.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your key)
4. Redeploy your site

## Files Ready for Deployment ✅

All your files are in the `/outputs` folder:
- ✅ All 9 HTML pages
- ✅ All 6 JavaScript files
- ✅ CSS styling
- ✅ Netlify configuration
- ✅ Environment file template
- ✅ Deployment guides

## Testing Checklist

After deployment, test these features:

- [ ] Can you register a new account?
- [ ] Can you log in?
- [ ] Can you create a new list?
- [ ] Can you add words to a list?
- [ ] Can you practice with flashcards?
- [ ] Can you see shared example lists?
- [ ] Does the leaderboard load?
- [ ] Do gamification stats update?

## Troubleshooting

### "Cannot read property 'from' of undefined"
- The Supabase client isn't initialized
- Check that script.js loads before other JS files

### "404 Not Found" on API calls
- You haven't set up the backend yet
- Choose Option A or B from Step 2 above

### "Relation does not exist" or "Table not found"
- Supabase tables aren't created
- Go back to Step 1

### Authentication not working
- Check Supabase URL and key in script.js
- Verify email confirmation is enabled in Supabase

### Dark mode toggle appears multiple times
- Clear browser cache
- Check that script.js only initializes once

## Recommended Path

For fastest deployment:

1. ✅ **Now:** Deploy frontend to Netlify (2 min)
2. ⏭️ **Next:** Set up Supabase tables (10 min)
3. ⏭️ **Then:** Refactor to use Supabase directly (1-2 hours)
4. ✅ **Done:** Fully working app!

## Need Help?

- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Your site URL will be:** `https://random-name-12345.netlify.app`

You can change this to a custom domain in Netlify settings.

Good luck! 🚀
