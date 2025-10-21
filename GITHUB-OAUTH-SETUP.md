# GitHub OAuth Setup Guide

Complete guide to enable GitHub login for ZodForge Dashboard.

## Status: 🚧 In Progress (90% Complete)

### ✅ What's Been Built:

1. **Database Schema** - `supabase-users-schema.sql`
2. **Supabase Client** - `lib/supabase.ts`
3. **API Key Generation** - `app/api/generate-user-key/route.ts`
4. **Auth Configuration** - `lib/auth.ts` (updated with GitHub provider)

### 🎯 What's Needed:

## Step 1: Run Database Migration

Run the SQL in your Supabase dashboard:

```bash
# File: supabase-users-schema.sql
# Go to: https://app.supabase.com → SQL Editor → New Query
# Paste the contents of supabase-users-schema.sql
# Click RUN
```

## Step 2: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: ZodForge Dashboard
   - **Homepage URL**: `https://zodforge-dashboard.vercel.app`
   - **Authorization callback URL**: `https://zodforge-dashboard.vercel.app/api/auth/callback/github`
4. Click **"Register application"**
5. **Copy the Client ID**
6. Click **"Generate a new client secret"**
7. **Copy the Client Secret**

## Step 3: Create Admin API Key

You need an admin API key to generate user keys. Run this in your zodforge-api:

```bash
# In zodforge-api directory
npx tsx -e "
import { createApiKey } from './src/lib/jwt-keys.js';
const key = createApiKey('system', 'Admin Key', 'enterprise', {
  permissions: ['admin'],
  expiresIn: 0, // Never expires
});
console.log('Admin API Key:', key);
"
```

## Step 4: Add Environment Variables

### Local Development (.env.local):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# Admin API Key (from Step 3)
ZODFORGE_ADMIN_API_KEY=zf_admin_key_here

# Existing variables
NEXT_PUBLIC_API_URL=https://web-production-f15d.up.railway.app
NEXTAUTH_SECRET=6Px0ZFGM3oo0N/EUf4fB9lN2SkwCJieGVZol0nhLEQ0=
NEXTAUTH_URL=http://localhost:3000
```

### Vercel Production:

Run these commands:

```bash
cd zodforge-dashboard

# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production

# GitHub OAuth
vercel env add GITHUB_ID production
vercel env add GITHUB_SECRET production

# Admin Key
vercel env add ZODFORGE_ADMIN_API_KEY production
```

## Step 5: Update Login Page (TODO)

The login page needs a GitHub button. Here's what to add to `app/login/page.tsx`:

```tsx
// Add this import
import { signIn } from 'next-auth/react';

// Add this button before the API key form:
<button
  onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
  className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
>
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
  Sign in with GitHub
</button>

<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-700"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-gray-900 text-gray-400">Or continue with API key</span>
  </div>
</div>
```

## Step 6: Update Type Definitions

Add to `types/next-auth.d.ts`:

```typescript
interface Session {
  user: {
    // ... existing fields
    userId?: string;
    loginMethod?: 'github' | 'apikey';
  };
}

interface JWT {
  // ... existing fields
  userId?: string;
  loginMethod?: string;
}
```

## Step 7: Test Locally

```bash
npm run dev
# Visit http://localhost:3000
# Click "Sign in with GitHub"
# Authorize the app
# Check if you're redirected to dashboard
```

## Step 8: Deploy

```bash
git add .
git commit -m "feat: Add GitHub OAuth login"
git push origin master
vercel --prod
```

## How It Works:

1. **User clicks "Sign in with GitHub"**
2. **GitHub OAuth flow** - User authorizes ZodForge
3. **signIn callback** - Creates/finds user in Supabase
4. **API key generation** - If new user, generates Free tier API key
5. **jwt callback** - Loads user's API key into session
6. **Dashboard access** - User can now use all features

## User Experience:

- ✅ First-time users get a Free tier API key automatically
- ✅ Returning users are logged in instantly
- ✅ API key is stored securely, never shown again
- ✅ Users can view their key in Dashboard → API Keys page
- ✅ Can upgrade to Pro/Enterprise via Stripe

## Troubleshooting:

**"Failed to generate API key"**
- Check `ZODFORGE_ADMIN_API_KEY` is set
- Verify the API key has 'admin' permissions
- Check API is accessible

**"User already exists"**
- This is normal for returning users
- They'll be logged in with their existing API key

**"GitHub OAuth error"**
- Verify `GITHUB_ID` and `GITHUB_SECRET` are correct
- Check callback URL matches exactly
- Ensure app is not in suspended state

## Next Features (Optional):

- [ ] Allow users to rotate their API keys
- [ ] Allow multiple API keys per user
- [ ] Team/organization support
- [ ] API key usage analytics per user
- [ ] Stripe integration for automatic tier upgrades

---

**Need help?** Check the main README or create a GitHub issue.
