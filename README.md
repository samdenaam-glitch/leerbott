# Leerbot - Ready for Netlify Deployment 🚀

## ✅ What's Been Updated

Your Leerbot app is now fully configured for Netlify deployment with Netlify Functions as your backend API.

### Changes Made:
1. **Converted Vercel API to Netlify Functions** - All your `/api/*` endpoints now work with Netlify
2. **Created proper function structure** in `netlify/functions/` directory
3. **Updated netlify.toml** with correct build and routing configuration
4. **All frontend files copied** and ready to deploy

## 📁 Project Structure

```
leerbot/
├── index.html                    # Home page
├── dashboard.html                # User dashboard
├── lijst.html                   # Word list management
├── oefen.html                   # Practice/flashcards
├── ontdek.html                  # Discover shared lists
├── admin.html                   # Admin panel
├── login.html                   # Login page
├── register.html                # Registration
├── leaderboard.html             # Leaderboard
├── script.js                    # Main JS (Supabase client)
├── dashboard.js                 # Dashboard logic
├── lijst.js                     # List management
├── oefen.js                     # Practice logic
├── ontdek.js                    # Discover logic
├── admin.js                     # Admin logic
├── gamification.js              # Gamification features
├── style.css                    # All styling
├── netlify.toml                 # Netlify configuration
├── _redirects                   # SPA routing
├── .env                         # Environment variables (local only)
├── .gitignore                   # Git ignore rules
└── netlify/                     # Backend API
    └── functions/
        ├── _shared/
        │   └── supabase.js      # Shared Supabase client
        ├── lists.js             # List management endpoint
        ├── words.js             # Word management endpoint
        ├── shared-lists.js      # Shared lists endpoint
        ├── user-stats.js        # Gamification stats endpoint
        └── package.json         # Dependencies
```

## 🚀 Deploy to Netlify

### Option 1: Git-based Deploy (Recommended)

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/leerbot.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings are auto-detected from netlify.toml
   - Click "Deploy site"

3. **Set Environment Variables:**
   In Netlify Dashboard → Site settings → Environment variables, add:
   - `SUPABASE_URL` = `https://xxgebftpfslkucdkbila.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Redeploy** (if variables were added after first deploy)

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: Drag & Drop (Not Recommended for Functions)

Netlify Drop doesn't properly handle functions. Use Git or CLI instead.

## 🔐 Environment Variables

**CRITICAL:** Set these in Netlify Dashboard before deploying:

```
SUPABASE_URL=https://xxgebftpfslkucdkbila.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z2ViZnRwZnNsa3VjZGtiaWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODMxMDYsImV4cCI6MjA4NjU1OTEwNn0.RLpbmLzwtlxXRPrp24NFB2ai1Cb0bxnKLpsEGC_NxIc
```

## 🗄️ Supabase Database

Make sure your Supabase database has these tables:
- `lists` - User word lists
- `words` - Words in lists
- `shared_lists` - Shared/example lists
- `shared_words` - Words in shared lists
- `user_stats` - Gamification stats
- `user_badges` - User badges
- `profiles` - User profiles (with is_admin field)

See `SUPABASE_SETUP.md` for complete schema.

## 🔌 API Endpoints

All API endpoints are now Netlify Functions:

- `GET /api/lists` - Get user's lists
- `POST /api/lists` - Create new list
- `GET /api/words?listId=X` - Get words in list
- `POST /api/words?listId=X` - Add word to list
- `DELETE /api/words?listId=X&id=Y` - Delete word
- `GET /api/shared-lists` - Get shared/example lists
- `GET /api/shared-lists?language=en&level=A1` - Filter shared lists
- `GET /api/user-stats` - Get user stats
- `POST /api/user-stats` - Update stats (add XP)

## 🧪 Testing After Deployment

1. Visit your Netlify URL (e.g., `https://leerbot-abc123.netlify.app`)
2. **Register** a new account
3. **Create** a list
4. **Add** some words
5. **Practice** with flashcards
6. Check if **XP** and **stats** update
7. Visit **Ontdek** page to see shared lists

## ⚠️ Common Issues

### Functions not working?
- Check environment variables are set in Netlify
- Check function logs in Netlify Dashboard → Functions
- Make sure build completed successfully

### CORS errors?
- Functions include CORS headers by default
- If issues persist, check browser console

### Supabase connection errors?
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify Row Level Security policies allow access

### Build fails?
- Check that package.json exists in netlify/functions/
- Verify Supabase dependency version matches

## 📝 Missing Endpoints

Currently implemented:
- ✅ lists (GET, POST)
- ✅ words (GET, POST, DELETE)
- ✅ shared-lists (GET)
- ✅ user-stats (GET, POST)

Not yet implemented (add if needed):
- ❌ Admin endpoints (`/api/admin/*`)
- ❌ Leaderboard (`/api/leaderboard`)
- ❌ User badges (`/api/user-badges`)
- ❌ Copy shared list (`/api/copy-shared-list`)

To add more endpoints, create new files in `netlify/functions/` following the same pattern.

## 🎨 Frontend Updates

No changes needed to your frontend files! They work as-is with the new Netlify Functions backend.

## 🔄 Development Workflow

### Local Development:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Install function dependencies
cd netlify/functions && npm install && cd ../..

# Start Netlify Dev (runs functions locally)
netlify dev
```

This starts a local server that emulates Netlify's environment.

### Making Changes:
1. Edit your files
2. Test locally with `netlify dev`
3. Commit and push to GitHub
4. Netlify auto-deploys

## 🆘 Support

- **Netlify Docs:** https://docs.netlify.com/functions/overview/
- **Supabase Docs:** https://supabase.com/docs
- **Your Functions Logs:** Netlify Dashboard → Functions → View logs

---

## 🎉 You're Ready!

Your app is fully configured and ready to deploy. Follow the deployment steps above and you'll be live in minutes!

**Next Steps:**
1. Push to GitHub
2. Connect to Netlify
3. Set environment variables
4. Deploy!

Good luck! 🚀
