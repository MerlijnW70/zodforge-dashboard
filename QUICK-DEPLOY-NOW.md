# Quick Deployment Guide - GitHub OAuth

**Status**: Code is ready, just needs configuration (5-10 minutes)

## Prerequisites Checklist

- [ ] Supabase account (free tier is fine)
- [ ] GitHub account
- [ ] Vercel account (already set up ✅)
- [ ] zodforge-api running on Railway (already deployed ✅)

---

## Step 1: Set Up Supabase Database (2 minutes)

### 1.1 Create/Access Supabase Project
1. Go to: https://app.supabase.com
2. Either use existing project or create new one
3. Wait for project to be ready

### 1.2 Run Database Migration
1. In Supabase dashboard → Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-users-schema.sql`
4. Paste into the query editor
5. Click **RUN** (bottom right)
6. ✅ You should see "Success. No rows returned"

### 1.3 Get Supabase Credentials
1. In Supabase dashboard → Click **Settings** (gear icon, left sidebar)
2. Click **API** (under Settings)
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **service_role secret** (under "Project API keys" section - click "Reveal" if hidden)

---

## Step 2: Create GitHub OAuth App (3 minutes)

### 2.1 Create OAuth App
1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"** (green button, top right)
3. Fill in the form:
   ```
   Application name: ZodForge Dashboard
   Homepage URL: https://zodforge-dashboard.vercel.app
   Authorization callback URL: https://zodforge-dashboard.vercel.app/api/auth/callback/github
   ```
4. Click **"Register application"**

### 2.2 Get OAuth Credentials
1. **Copy the Client ID** (displayed on the screen)
2. Click **"Generate a new client secret"** (green button)
3. **Copy the Client Secret** (⚠️ shown only once!)

---

## Step 3: Generate Admin API Key (1 minute)

Run this command in your **zodforge-api** directory:

```bash
cd C:\json2ts-generator\zodforge-api
npx tsx -e "import { createApiKey } from './dist/lib/jwt-keys.js'; const key = createApiKey('system', 'Admin Key for Dashboard', 'enterprise', { permissions: ['admin'], expiresIn: 0 }); console.log('Admin API Key:', key);"
```

**Copy the output** (starts with `zf_`)

---

## Step 4: Add Environment Variables to Vercel (2 minutes)

### Option A: Via Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/merlijns-projects-2bec6ba7/zodforge-dashboard/settings/environment-variables
2. Add these 5 variables (click "Add New" for each):

| Key | Value | Note |
|-----|-------|------|
| `GITHUB_ID` | `<paste Client ID from Step 2.2>` | From GitHub OAuth app |
| `GITHUB_SECRET` | `<paste Client Secret from Step 2.2>` | From GitHub OAuth app |
| `NEXT_PUBLIC_SUPABASE_URL` | `<paste Project URL from Step 1.3>` | From Supabase settings |
| `SUPABASE_SERVICE_KEY` | `<paste service_role from Step 1.3>` | From Supabase API settings |
| `ZODFORGE_ADMIN_API_KEY` | `<paste API key from Step 3>` | Generated via npx command |

3. For each variable, ensure "Production", "Preview", and "Development" are all checked
4. Click "Save" for each

### Option B: Via CLI (Alternative)
```bash
cd C:\json2ts-generator\zodforge-dashboard

vercel env add GITHUB_ID production
# Paste the Client ID when prompted

vercel env add GITHUB_SECRET production
# Paste the Client Secret when prompted

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste the Supabase URL when prompted

vercel env add SUPABASE_SERVICE_KEY production
# Paste the service_role key when prompted

vercel env add ZODFORGE_ADMIN_API_KEY production
# Paste the admin API key when prompted
```

---

## Step 5: Deploy to Vercel (1 minute)

### 5.1 Trigger Deployment
```bash
cd C:\json2ts-generator\zodforge-dashboard
git add .
git commit -m "chore: Configure GitHub OAuth environment variables"
git push origin main
```

Vercel will auto-deploy (or manually trigger via dashboard)

### 5.2 Verify Deployment
```bash
vercel --prod
```

---

## Step 6: Test GitHub Login (1 minute)

1. Go to: https://zodforge-dashboard.vercel.app
2. Click **"Sign in with GitHub"**
3. Authorize the ZodForge Dashboard app
4. You should be redirected to the dashboard
5. Check that your name and tier ("Free Plan") appear in the sidebar

### Expected Behavior:
- ✅ First-time users get a Free tier API key automatically
- ✅ Returning users are logged in with their existing key
- ✅ Dashboard shows usage stats
- ✅ API key is accessible in "API Keys" page

---

## Troubleshooting

### Error: "Failed to generate API key"
**Cause**: Admin API key is incorrect or not set
**Fix**: Re-run Step 3 and verify the key starts with `zf_` and has `enterprise` tier

### Error: "Configuration: OAuthCallbackError"
**Cause**: GitHub OAuth credentials are incorrect
**Fix**:
1. Double-check `GITHUB_ID` and `GITHUB_SECRET` in Vercel
2. Verify callback URL in GitHub app matches: `https://zodforge-dashboard.vercel.app/api/auth/callback/github`

### Error: "Supabase client error"
**Cause**: Supabase credentials are incorrect
**Fix**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is your project URL
2. Verify `SUPABASE_SERVICE_KEY` is the **service_role** key (not anon key)

### GitHub button doesn't work
**Cause**: Environment variables not loaded
**Fix**:
1. Check Vercel dashboard → Environment Variables
2. Ensure all 5 variables are set for "Production"
3. Trigger new deployment: `vercel --prod`

---

## Verification Checklist

After deployment, verify:

- [ ] Can click "Sign in with GitHub" on login page
- [ ] GitHub authorization flow works
- [ ] Redirected to dashboard after authorization
- [ ] Name/email appears in sidebar
- [ ] "Free Plan" tier shows in sidebar
- [ ] Can navigate to "API Keys" page
- [ ] Can see API key details (kid, tier, created date)
- [ ] Can copy API key (shows `zf_` prefix)

---

## What Happens Behind the Scenes?

1. **User clicks "Sign in with GitHub"** → GitHub OAuth flow starts
2. **User authorizes app** → GitHub sends profile data to callback
3. **signIn callback runs** → Creates user in Supabase (if new)
4. **API key generation** → If new user, calls `/api/generate-user-key`
5. **Key stored** → API key linked to user in `user_api_keys` table
6. **JWT callback** → Loads user's API key into session
7. **Redirect to dashboard** → User is authenticated with API key in session

---

## Environment Variables Reference

**Copy-paste ready format for Vercel dashboard:**

```env
# GitHub OAuth (from https://github.com/settings/developers)
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here

# Supabase (from https://app.supabase.com → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin API Key (generated via npx command in zodforge-api)
ZODFORGE_ADMIN_API_KEY=zf_enterprise_...
```

---

## Next Steps After Deployment

1. **Test the integration**: Create a test account, verify API key generation
2. **Update landing page**: Add "Sign in with GitHub" as a CTA option
3. **Monitor Supabase**: Check user registrations in Supabase dashboard
4. **Optional**: Set up Stripe for tier upgrades
5. **Optional**: Add usage analytics tracking

---

**Estimated Total Time**: 5-10 minutes
**Difficulty**: Easy (just copy-paste configuration)

Need help? Check GITHUB-OAUTH-SETUP.md for detailed troubleshooting.
