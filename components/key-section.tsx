'use client';

import { useState } from 'react';
import { Copy, Eye, EyeOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { ApiKeyInfo } from '@/lib/types';

interface KeySectionProps {
  apiKey: string;
  keyInfo: ApiKeyInfo;
}

export function KeySection({ apiKey, keyInfo }: KeySectionProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const maskedKey = `${apiKey.slice(0, 10)}${'*'.repeat(apiKey.length - 14)}${apiKey.slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotate = async () => {
    setRotating(true);
    try {
      const response = await fetch(`/api/rotate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kid: keyInfo.kid }),
      });

      if (response.ok) {
        const data = await response.json();
        // Show new key to user before refresh
        alert(`New API Key: ${data.apiKey}\n\nSave this key - it won't be shown again.`);
        // Refresh page to get new session
        window.location.reload();
      } else {
        alert('Failed to rotate key. Please try again.');
      }
    } catch (error) {
      console.error('Rotation error:', error);
      alert('An error occurred while rotating the key.');
    } finally {
      setRotating(false);
      setShowRotateConfirm(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Current API Key</h2>
        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
          {keyInfo.name}
        </span>
      </div>

      {/* API Key Display */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <code className="flex-1 text-white font-mono text-sm break-all">
            {showKey ? apiKey : maskedKey}
          </code>
          <div className="flex gap-2">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rotate Key Section */}
      {!showRotateConfirm ? (
        <button
          onClick={() => setShowRotateConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-700 text-orange-300 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Rotate API Key
        </button>
      ) : (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-300 mb-1">Are you sure?</p>
              <p className="text-sm text-orange-200/80">
                Rotating your API key will invalidate the current key immediately. Make sure to
                update all applications using this key.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRotate}
              disabled={rotating}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {rotating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rotating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Yes, Rotate Key
                </>
              )}
            </button>
            <button
              onClick={() => setShowRotateConfirm(false)}
              disabled={rotating}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
