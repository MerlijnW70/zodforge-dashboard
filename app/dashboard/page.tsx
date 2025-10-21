import { auth } from '@/lib/auth';
import { ZodForgeApiClient } from '@/lib/api-client';
import { Activity, TrendingUp, Zap, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const client = new ZodForgeApiClient(session.user.apiKey);
  const data = await client.getKeyInfo();
  const health = await client.getHealth();

  const { key, usage } = data;
  const monthly = usage.monthly;
  const daily = usage.daily;

  // Calculate progress
  const monthlyProgress = monthly
    ? (monthly.requests / key.quota.monthlyLimit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">
          Welcome back, {key.name} • {key.tier.charAt(0).toUpperCase() + key.tier.slice(1)} Plan
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Requests */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase">This Month</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {monthly?.requests.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-400">
            of {key.quota.monthlyLimit.toLocaleString()} requests
          </p>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase">Success Rate</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {monthly ? (monthly.successRate * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-400">Last 30 days</p>
          {monthly && monthly.successRate >= 0.95 ? (
            <p className="mt-4 text-sm text-green-400 font-medium">Excellent performance</p>
          ) : (
            <p className="mt-4 text-sm text-yellow-400 font-medium">Room for improvement</p>
          )}
        </div>

        {/* Avg Latency */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase">Avg Latency</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {monthly?.avgLatency ? `${monthly.avgLatency.toFixed(0)}ms` : 'N/A'}
          </p>
          <p className="text-sm text-gray-400">Response time</p>
          {monthly && monthly.avgLatency < 100 ? (
            <p className="mt-4 text-sm text-green-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Lightning fast
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-400">Within normal range</p>
          )}
        </div>

        {/* Total Cost */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase">Total Cost</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${monthly?.totalCost.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400">This month</p>
          <p className="mt-4 text-sm text-gray-400">
            {monthly?.totalTokens.toLocaleString() || 0} tokens
          </p>
        </div>
      </div>

      {/* Today's Activity */}
      {daily && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Today&apos;s Activity</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Requests</p>
              <p className="text-2xl font-bold text-white">{daily.requests.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {(daily.successRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Tokens Used</p>
              <p className="text-2xl font-bold text-white">{daily.totalTokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Cost</p>
              <p className="text-2xl font-bold text-white">${daily.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">API Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(health.services).map(([name, service]) => (
            <div key={name} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white capitalize">{name}</p>
                <p className="text-xs text-gray-400">{service.latency}ms</p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  service.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/keys"
            className="p-4 bg-gray-900 hover:bg-gray-850 border border-gray-700 rounded-lg transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Manage API Keys</h3>
            <p className="text-sm text-gray-400">View and rotate your API keys</p>
          </a>
          <a
            href="/dashboard/billing"
            className="p-4 bg-gray-900 hover:bg-gray-850 border border-gray-700 rounded-lg transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Billing & Invoices</h3>
            <p className="text-sm text-gray-400">Manage your subscription</p>
          </a>
          <a
            href="https://docs.zodforge.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-900 hover:bg-gray-850 border border-gray-700 rounded-lg transition-colors"
          >
            <h3 className="font-medium text-white mb-1">Documentation</h3>
            <p className="text-sm text-gray-400">View API documentation</p>
          </a>
        </div>
      </div>
    </div>
  );
}
