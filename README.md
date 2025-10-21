# ZodForge Cloud Dashboard

Customer dashboard for managing ZodForge Cloud API keys, usage analytics, and billing.

## Features

- 🔐 **Secure Authentication** - API key-based login with NextAuth.js
- 📊 **Usage Analytics** - Real-time API usage tracking and metrics
- 🔑 **API Key Management** - View, rotate, and manage API keys
- 💳 **Billing Integration** - Stripe Customer Portal integration
- 📈 **Performance Metrics** - Success rates, latency, and cost tracking
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (ready to use)
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 20.x or later
- ZodForge API running (local or production)
- Valid API key for testing

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```bash
# ZodForge API
NEXT_PUBLIC_API_URL=https://web-production-f15d.up.railway.app
# For local development: http://localhost:3000

# NextAuth
NEXTAUTH_SECRET=your-secret-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Stripe (optional - for billing portal)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Dashboard Pages

### 🏠 Overview (`/dashboard`)
- Monthly/daily request stats
- Success rate monitoring
- Latency metrics
- API cost tracking
- Real-time API health status

### 🔑 API Keys (`/dashboard/keys`)
- View current API key (masked)
- Copy key to clipboard
- Rotate API keys securely
- View rate limits and quotas

### 📊 Usage (`/dashboard/usage`)
- Detailed usage analytics
- Monthly performance breakdown
- Today's activity
- Rate limit monitoring
- Optimization tips

### 💳 Billing (`/dashboard/billing`)
- Current plan details
- Usage this billing period
- Stripe Customer Portal link
- Plan upgrade options

## Authentication Flow

1. User enters API key on `/login`
2. API key verified against ZodForge API (`/api/v1/api-keys/me`)
3. NextAuth creates session with encrypted JWT
4. Redirect to dashboard
5. Protected routes check session automatically

## API Integration

The dashboard connects to the ZodForge API via:

- **API Client**: `lib/api-client.ts`
- **Auth Verification**: `lib/auth.ts`
- **Type Definitions**: `lib/types.ts`

### Available Endpoints

```typescript
// Get API key info + usage stats
GET /api/v1/api-keys/me

// Rotate API key
POST /api/v1/api-keys/:kid/rotate

// Health check
GET /api/v1/health
```

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables (Production)

```bash
NEXT_PUBLIC_API_URL=https://web-production-f15d.up.railway.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://app.zodforge.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Project Structure

```
zodforge-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handlers
│   │   ├── create-portal-session/  # Stripe portal
│   │   └── rotate-key/             # API key rotation
│   ├── dashboard/
│   │   ├── billing/                # Billing page
│   │   ├── keys/                   # API keys page
│   │   ├── usage/                  # Usage analytics
│   │   ├── layout.tsx              # Dashboard layout
│   │   └── page.tsx                # Dashboard home
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Root redirect
├── components/
│   ├── dashboard-nav.tsx           # Sidebar navigation
│   └── key-section.tsx             # API key display
├── lib/
│   ├── api-client.ts               # ZodForge API client
│   ├── auth.ts                     # NextAuth config
│   └── types.ts                    # TypeScript types
├── types/
│   └── next-auth.d.ts              # NextAuth type extensions
└── .env.local                      # Environment variables
```

## Security

- ✅ API keys stored in encrypted JWT sessions
- ✅ All requests authenticated
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced in production
- ✅ Rate limiting via ZodForge API
- ✅ CORS protection

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

- Documentation: https://docs.zodforge.com
- Email: support@zodforge.com
- GitHub Issues: https://github.com/MerlijnW70/zodforge-dashboard/issues

## License

MIT © merlin white

---

Built with ❤️ using [Claude Code](https://claude.com/claude-code)
