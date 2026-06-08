'use client';
import { useState } from 'react';
import type { WalletState } from '@/hooks/useWallet';

export default function ConnectWallet({
  publicKey,
  connecting,
  error,
  connect,
  disconnect,
}: WalletState) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          aria-label="Copy public key to clipboard"
          className="rounded bg-gray-100 px-3 py-1 font-mono text-sm text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {copied ? 'Copied!' : `${publicKey.slice(0, 6)}…${publicKey.slice(-6)}`}
        </button>
        <button
          type="button"
          onClick={disconnect}
          aria-label="Disconnect wallet"
          className="text-sm text-red-500 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400/60"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="text-right" role="status" aria-live="polite">
      <button
        type="button"
        onClick={connect}
        disabled={connecting}
        aria-label="Connect Freighter wallet"
        className="rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {connecting ? 'Connecting…' : 'Connect Freighter'}
      </button>
      {error && <p className="mt-2 max-w-xs text-sm text-red-500">{error}</p>}
    </div>
  );
}
