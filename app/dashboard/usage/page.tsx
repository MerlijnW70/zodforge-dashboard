import { auth } from '@/lib/auth';
import { ZodForgeApiClient } from '@/lib/api-client';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

export default async function UsagePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const client = new ZodForgeApiClient(session.user.apiKey);
  const data = await client.getKeyInfo();
  const { key, usage } = data;

  const monthly = usage.monthly;
  const daily = usage.daily;

  // Calculate metrics
  const requestsRemaining = key.quota.monthlyLimit - (monthly?.requests || 0);
  const usagePercentage = monthly
    ? ((monthly.requests / key.quota.monthlyLimit) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Usage & Analytics</h1>
        <p className="text-gray-400">Monitor your API usage and performance metrics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">MONTHLY</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {monthly?.requests.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-400">Total Requests</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">QUOTA</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {requestsRemaining.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Remaining</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">TODAY</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {daily?.requests.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-400">Requests</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-400">USAGE</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{usagePercentage}%</p>
          <p className="text-xs text-gray-400">Of Monthly Quota</p>
        </div>
      </div>

      {/* Monthly Usage Details */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Monthly Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Total Requests</p>
            <p className="text-2xl font-bold text-white">{monthly?.requests.toLocaleString() || 0}</p>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(parseFloat(usagePercentage), 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Success Rate</p>
            <p className="text-2xl font-bold text-white">
              {monthly ? (monthly.successRate * 100).toFixed(1) : 0}%
            </p>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full"
                style={{ width: monthly ? `${monthly.successRate * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Avg Latency</p>
            <p className="text-2xl font-bold text-white">
              {monthly?.avgLatency ? `${monthly.avgLatency.toFixed(0)}ms` : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {monthly && monthly.avgLatency < 100 ? 'Excellent' : 'Good'}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Total Tokens</p>
            <p className="text-2xl font-bold text-white">
              {monthly?.totalTokens.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ${monthly?.totalCost.toFixed(2) || '0.00'} cost
            </p>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      {daily && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Today&apos;s Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Requests</p>
              <p className="text-3xl font-bold text-white">{daily.requests.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {key.rateLimit.requestsPerDay - daily.requests} remaining today
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-white">
                {(daily.successRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {daily.successRate >= 0.95 ? 'Excellent' : 'Good'}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Tokens Used</p>
              <p className="text-3xl font-bold text-white">{daily.totalTokens.toLocaleString()}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Cost Today</p>
              <p className="text-3xl font-bold text-white">${daily.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limits */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Rate Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Per Minute</p>
            <p className="text-3xl font-bold text-white">{key.rateLimit.requestsPerMinute}</p>
            <p className="text-xs text-gray-500 mt-1">requests/minute</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Per Day</p>
            <p className="text-3xl font-bold text-white">
              {key.rateLimit.requestsPerDay.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">requests/day</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Per Month</p>
            <p className="text-3xl font-bold text-white">
              {key.quota.monthlyLimit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">requests/month</p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-6">
        <h3 className="text-white font-medium mb-2">💡 Optimization Tips</h3>
        <ul className="space-y-2 text-sm text-blue-200/80">
          <li>• Cache refined schemas to avoid duplicate API calls</li>
          <li>• Use batch operations when processing multiple schemas</li>
          <li>• Monitor your success rate - low rates may indicate integration issues</li>
          <li>
            • Upgrade your plan if you&apos;re consistently hitting rate limits
          </li>
        </ul>
      </div>
    </div>
  );
}
