# Deployment Checklist ✅

## Pre-Deployment

- [ ] Supabase database is set up with all required tables
- [ ] Supabase Row Level Security (RLS) policies are configured
- [ ] You have your Supabase URL and Anon Key ready

## Deployment Steps

### 1. Push to GitHub (5 minutes)

```bash
git init
git add .
git commit -m "Initial commit - Leerbot ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/leerbot.git
git push -u origin main
```

- [ ] Repository created on GitHub
- [ ] Code pushed successfully

### 2. Connect to Netlify (2 minutes)

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select "GitHub"
4. Authorize Netlify to access your repositories
5. Select your `leerbot` repository
6. Build settings should auto-detect from `netlify.toml`
7. Click "Deploy site"

- [ ] Site connected to Netlify
- [ ] Initial deploy started

### 3. Configure Environment Variables (2 minutes)

In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Click "Add a variable"
3. Add:
   - Variable: `SUPABASE_URL`
   - Value: `https://xxgebftpfslkucdkbila.supabase.co`
4. Add another:
   - Variable: `SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z2ViZnRwZnNsa3VjZGtiaWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODMxMDYsImV4cCI6MjA4NjU1OTEwNn0.RLpbmLzwtlxXRPrp24NFB2ai1Cb0bxnKLpsEGC_NxIc`

- [ ] Environment variables added
- [ ] Variables saved

### 4. Redeploy with Variables (1 minute)

1. Go to Deploys
2. Click "Trigger deploy" → "Deploy site"
3. Wait for build to complete (2-3 minutes)

- [ ] Build successful
- [ ] Functions deployed

## Post-Deployment Testing

### Test Basic Features:

- [ ] Site loads correctly
- [ ] Can register a new account
- [ ] Can log in with credentials
- [ ] Can create a new word list
- [ ] Can add words to a list
- [ ] Can view word list
- [ ] Can delete words
- [ ] Can practice with flashcards
- [ ] XP and level update after practice
- [ ] Can view "Ontdek" (discover) page
- [ ] Shared lists appear

### Check Technical Details:

- [ ] No console errors (F12 → Console)
- [ ] API calls return 200 (F12 → Network)
- [ ] Functions are running (Netlify Dashboard → Functions)
- [ ] No 404 errors on API endpoints

## Troubleshooting

### If build fails:
1. Check build logs in Netlify
2. Verify `netlify.toml` is in root directory
3. Check `netlify/functions/package.json` exists

### If functions return errors:
1. Go to Netlify Dashboard → Functions → View logs
2. Check environment variables are set correctly
3. Verify Supabase URL and key are correct

### If authentication doesn't work:
1. Check Supabase project is active
2. Verify email confirmation is enabled in Supabase
3. Check browser console for errors

### If lists/words don't save:
1. Verify Supabase tables exist
2. Check RLS policies allow inserts
3. Look at function logs in Netlify

## Success! 🎉

Once all checkboxes are complete, your Leerbot app is live and fully functional!

Your site URL: `https://YOUR-SITE-NAME.netlify.app`

## Optional: Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to point your domain to Netlify
4. Netlify will automatically provision SSL certificate

- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate active

---

**Need help?** Check README.md for detailed documentation or visit Netlify Support.
