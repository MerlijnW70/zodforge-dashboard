import { auth } from '@/lib/auth';
import { ZodForgeApiClient } from '@/lib/api-client';
import { redirect } from 'next/navigation';
import { CreditCard, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const tierFeatures = {
  free: {
    name: 'Free Tier',
    price: '$0',
    features: ['100 requests/month', 'Community support', 'Basic documentation'],
    color: 'gray',
  },
  pro: {
    name: 'Pro',
    price: '$19',
    features: [
      '10,000 requests/month',
      'Priority support',
      'Advanced features',
      'Usage analytics',
    ],
    color: 'blue',
  },
  enterprise: {
    name: 'Enterprise',
    price: '$99',
    features: [
      'Unlimited requests',
      '24/7 dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    color: 'purple',
  },
};

export default async function BillingPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const client = new ZodForgeApiClient(session.user.apiKey);
  const data = await client.getKeyInfo();
  const { key, usage } = data;

  const currentTier = tierFeatures[key.tier as keyof typeof tierFeatures];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-400">Manage your plan and view billing information</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{currentTier.name}</h2>
              <p className="text-sm text-gray-400">Current plan</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{currentTier.price}</p>
            <p className="text-sm text-gray-400">/month</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Plan Features</h3>
          <ul className="space-y-2">
            {currentTier.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {key.tier !== 'enterprise' && (
          <a
            href="https://zodforge.dev/#pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200"
          >
            <TrendingUp className="w-5 h-5" />
            {key.tier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Enterprise'}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Usage This Month */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Usage This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">API Requests</p>
            <p className="text-3xl font-bold text-white mb-1">
              {usage.monthly?.requests.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500">
              of {key.quota.monthlyLimit.toLocaleString()} limit
            </p>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(((usage.monthly?.requests || 0) / key.quota.monthlyLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Total Tokens</p>
            <p className="text-3xl font-bold text-white mb-1">
              {usage.monthly?.totalTokens.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500">Used this billing period</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Estimated Cost</p>
            <p className="text-3xl font-bold text-white mb-1">
              ${usage.monthly?.totalCost.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500">AI provider costs</p>
          </div>
        </div>
      </div>

      {/* Stripe Customer Portal */}
      {key.tier !== 'free' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Manage Subscription</h2>
              <p className="text-sm text-gray-400">
                Update payment method, view invoices, or cancel subscription
              </p>
            </div>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>

          <form action="/api/create-portal-session" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Open Billing Portal
              <ExternalLink className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            You&apos;ll be redirected to Stripe&apos;s secure billing portal to manage your
            subscription.
          </p>
        </div>
      )}

      {/* Billing History Notice */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-6">
        <h3 className="text-white font-medium mb-2">Need help with billing?</h3>
        <p className="text-sm text-blue-200/80 mb-4">
          Contact our support team at{' '}
          <a href="mailto:billing@zodforge.com" className="text-blue-400 hover:underline">
            billing@zodforge.com
          </a>{' '}
          for assistance with invoices, refunds, or plan changes.
        </p>
      </div>
    </div>
  );
}
