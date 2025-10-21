import { auth } from '@/lib/auth';
import { ZodForgeApiClient } from '@/lib/api-client';
import { redirect } from 'next/navigation';
import { KeySection } from '@/components/key-section';
import { Key, Shield, Clock } from 'lucide-react';

export default async function APIKeysPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const client = new ZodForgeApiClient(session.user.apiKey);
  const data = await client.getKeyInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
        <p className="text-gray-400">Manage and rotate your ZodForge API keys</p>
      </div>

      {/* Current API Key */}
      <KeySection apiKey={session.user.apiKey} keyInfo={data.key} />

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Key ID</p>
              <p className="text-white font-mono text-sm">{data.key.kid}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Permissions</p>
              <p className="text-white font-medium">
                {data.key.permissions.join(', ') || 'Standard'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-white font-medium">
                {new Date(data.key.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Rate Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Requests per Minute</p>
              <p className="text-2xl font-bold text-white">
                {data.key.rateLimit.requestsPerMinute}
              </p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Requests per Day</p>
              <p className="text-2xl font-bold text-white">
                {data.key.rateLimit.requestsPerDay}
              </p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Monthly quota: {data.key.quota.monthlyLimit.toLocaleString()} requests
        </p>
      </div>

      {/* Security Best Practices */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Security Best Practices</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Never commit API keys to version control</strong> - Use
              environment variables instead
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Rotate keys regularly</strong> - We recommend rotating
              every 90 days
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Use separate keys per environment</strong> - Different
              keys for development, staging, and production
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Monitor usage patterns</strong> - Check for unexpected
              spikes in the Usage dashboard
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
