# Netlify Deployment Guide for Leerbot 📚

## ⚠️ Important: Backend API Required

Your app makes API calls to `/api/*` endpoints. You have two options:

### Option A: Use Supabase Directly (Recommended - Easier)
Modify your JavaScript to use Supabase client methods directly instead of custom API endpoints. This means:
- Replace `/api?resource=lists` with direct Supabase queries
- Replace `/api/words` with Supabase table operations
- Use Supabase Row Level Security (RLS) for permissions

### Option B: Create Netlify Functions (Advanced)
Create serverless functions in `netlify/functions/` directory to handle your API endpoints.

## 🚀 Quick Deploy

### Option 1: Drag & Drop Deploy
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop all these files into the upload area:
   - index.html
   - netlify.toml
   - _redirects
   - .gitignore
3. Your site will be live in seconds!

### Option 2: Git-based Deploy
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Use these build settings:
   - **Build command:** (leave empty for static sites)
   - **Publish directory:** `.` (root directory)
6. Click "Deploy site"

## 🔐 Environment Variables Setup

**Important:** Don't commit your .env file to Git!

In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add these variables:
   - `SUPABASE_URL` = `https://xxgebftpfslkucdkbila.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z2ViZnRwZnNsa3VjZGtiaWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODMxMDYsImV4cCI6MjA4NjU1OTEwNn0.RLpbmLzwtlxXRPrp24NFB2ai1Cb0bxnKLpsEGC_NxIc`

## 📝 What I Fixed

### The Problem
You were getting a 404 error because:
- Only configuration files were uploaded (no actual website files)
- No Netlify-specific configuration was present

### The Solution
I created/copied:
1. **netlify.toml** - Netlify configuration with API routing
2. **_redirects** - SPA routing configuration
3. **All your HTML files** - index, dashboard, lijst, oefen, ontdek, admin, login, register, leaderboard
4. **All your JavaScript files** - Complete frontend logic
5. **style.css** - Your complete styling
6. **.gitignore** - Keeps sensitive files out of Git
7. **.env** - Your Supabase credentials (don't commit this!)

### ⚠️ API Endpoints Your App Uses
Your app currently makes calls to these endpoints:
- `/api?resource=lists` - Get/create user lists
- `/api/words?listId=X` - Manage words in lists  
- `/api/admin/*` - Admin operations
- `/api/user-stats` - Gamification stats
- `/api/user-badges` - Badge system
- `/api/leaderboard` - Leaderboard data
- `/api/shared-lists` - Discover shared lists

**These will return 404 errors without a backend!** See the Backend Setup section below.

## 🔄 Next Steps

### CRITICAL: Backend Setup

Your app needs API endpoints to work. Choose one option:

#### Option A: Refactor to Use Supabase Directly (Easiest)
1. Replace API calls in your JavaScript with direct Supabase client calls
2. Example transformation:
```javascript
// Current code (won't work):
const res = await fetch('/api?resource=lists', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// Replace with (will work):
const { data, error } = await supabase
  .from('lists')
  .select('*')
```
3. Set up Supabase tables and Row Level Security
4. This approach requires no backend deployment - everything runs in the browser

#### Option B: Create Netlify Functions
1. Create a `netlify/functions` directory
2. Create a file for each endpoint (e.g., `netlify/functions/lists.js`)
3. Example function:
```javascript
// netlify/functions/lists.js
exports.handler = async (event, context) => {
  // Your API logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ data: [] })
  }
}
```
4. Deploy - Netlify will automatically detect and deploy your functions

#### Option C: Deploy Separate Backend
1. Deploy your backend API to another service (Vercel, Railway, Fly.io)
2. Update your JavaScript to point to the backend URL
3. Enable CORS on your backend

### To Use Your Deployed Website:
1. Replace `index.html` with your actual website files
2. Add any additional HTML, CSS, JS files
3. Keep the `netlify.toml` and `_redirects` files
4. Update `.gitignore` as needed
5. Set environment variables in Netlify (don't use hardcoded credentials)

### File Structure:
```
leerbot/
├── index.html              (home page)
├── dashboard.html          (user dashboard)
├── lijst.html             (word list view)
├── oefen.html             (practice/flashcards)
├── ontdek.html            (discover shared lists)
├── admin.html             (admin panel)
├── login.html             (login page)
├── register.html          (registration)
├── leaderboard.html       (leaderboard)
├── script.js              (main JS with Supabase)
├── dashboard.js           (dashboard logic)
├── lijst.js               (list management)
├── oefen.js               (practice logic)
├── ontdek.js              (discover logic)
├── admin.js               (admin logic)
├── gamification.js        (gamification features)
├── style.css              (all styling)
├── netlify.toml           (keep this)
├── _redirects             (keep this)
├── .gitignore             (keep this)
└── .env                   (DON'T commit)
```

## 🛠️ Using Environment Variables in Your Code

Instead of hardcoding credentials in index.html, use environment variables:

```javascript
// For client-side JavaScript (index.html)
// Note: In static sites, env vars must be injected at build time
// or use Netlify's environment variable injection

// For serverless functions (if you add them later):
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
```

## 🔒 Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Use Netlify environment variables** - Set them in the dashboard
3. **Rotate keys if exposed** - If you accidentally commit keys, regenerate them in Supabase
4. **Use Row Level Security** - Configure proper security rules in Supabase

## ✅ Testing Your Deployment

After deploying:
1. Visit your Netlify URL
2. You should see the "Leerbot" welcome page
3. Check that Supabase connection shows "Successfully connected"
4. Open browser console (F12) to check for any errors

## 🆘 Troubleshooting

### Still getting 404?
- Make sure `index.html` is in the root directory
- Check that publish directory is set to `.` in Netlify settings
- Verify `_redirects` file is deployed

### Supabase not connecting?
- Check environment variables in Netlify dashboard
- Verify your Supabase project is active
- Check browser console for detailed error messages

### Build failures?
- If you have no build process, leave build command empty
- Make sure all files are committed to your repository

## 📚 Additional Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Environment Variables in Netlify](https://docs.netlify.com/environment-variables/overview/)

---

Good luck with your deployment! 🎉
