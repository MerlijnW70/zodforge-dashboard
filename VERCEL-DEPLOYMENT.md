# Deploy ZodForge Dashboard to Vercel

Quick guide to deploy your dashboard to production.

## Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Search for `zodforge-dashboard` or paste: `https://github.com/MerlijnW70/zodforge-dashboard`
4. Click **Import**

## Step 2: Configure Project

### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### Project Name
- **Project Name**: `zodforge-dashboard` (or `zodforge-app`)

## Step 3: Add Environment Variables

Click **"Environment Variables"** and add these:

### Required Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://web-production-f15d.up.railway.app` | Your ZodForge API URL |
| `NEXTAUTH_SECRET` | Generate with command below | Required for NextAuth |
| `NEXTAUTH_URL` | `https://zodforge-dashboard.vercel.app` | Will be your Vercel URL |

### Optional (Stripe):

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |

### Generate NEXTAUTH_SECRET:

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Or use online generator: https://generate-secret.vercel.app/32

**Important**: Copy the generated secret and paste it as the value for `NEXTAUTH_SECRET`.

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. You'll see: ✅ "Deployment Ready"

## Step 5: Get Your Dashboard URL

After deployment, you'll receive a URL like:

- **Production URL**: `https://zodforge-dashboard.vercel.app`

Or if you have a custom domain:
- **Custom Domain**: `https://app.zodforge.com`

## Step 6: Set Up Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **"Add"**
3. Enter: `app.zodforge.com`
4. Follow DNS configuration instructions
5. Add CNAME record:
   ```
   Name: app
   Type: CNAME
   Value: cname.vercel-dns.com
   ```

## Step 7: Update NEXTAUTH_URL

After getting your production URL:

1. Go to **Project Settings** → **Environment Variables**
2. Find `NEXTAUTH_URL`
3. Update to your production URL:
   - `https://zodforge-dashboard.vercel.app` (Vercel default)
   - OR `https://app.zodforge.com` (custom domain)
4. Redeploy (Deployments → Click "..." → Redeploy)

## Step 8: Test Your Dashboard

1. Visit your dashboard URL
2. You should see the login page
3. Enter a valid ZodForge API key
4. Verify all pages work:
   - ✅ `/dashboard` - Overview
   - ✅ `/dashboard/keys` - API Keys
   - ✅ `/dashboard/usage` - Usage Analytics
   - ✅ `/dashboard/billing` - Billing

## Troubleshooting

### Build fails:
- Check environment variables are set correctly
- Verify `NEXT_PUBLIC_API_URL` is accessible
- Check build logs for specific errors

### Login doesn't work:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your production URL
- Ensure ZodForge API is running and accessible

### API calls fail:
- Verify `NEXT_PUBLIC_API_URL` points to Railway production
- Check CORS settings on ZodForge API
- Test API health: `https://web-production-f15d.up.railway.app/api/v1/health`

## Environment Variable Reference

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### Production (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://web-production-f15d.up.railway.app
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://zodforge-dashboard.vercel.app
```

## Automatic Deployments

Vercel will automatically deploy when you:
- ✅ Push to `master` branch (production)
- ✅ Push to any branch (preview deployment)
- ✅ Open pull requests (preview deployment)

## Monitoring

View deployment status and logs:
- **Dashboard**: https://vercel.com/dashboard
- **Project**: Click on `zodforge-dashboard`
- **Deployments**: View all deployments
- **Analytics**: Track visitor metrics

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying
- ZodForge Support: support@zodforge.com

---

**Need help?** Check the main README.md or contact support.
