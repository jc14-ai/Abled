'use client';

import { useState } from 'react';
import { buildDisburseXDR } from '@/lib/abled-contract';
import { signAndSubmit } from '@/lib/sign';

interface DisburseModalProps {
  adminAddress: string;
  beneficiaryAddress: string;
  beneficiaryName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DisburseModal({ 
  adminAddress, 
  beneficiaryAddress, 
  beneficiaryName,
  onClose, 
  onSuccess 
}: DisburseModalProps) {
  const [amount, setAmount] = useState('500'); // Default to 500 XLM
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisburse = async () => {
    const amountValue = parseFloat(amount);
    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const xdr = await buildDisburseXDR(adminAddress, beneficiaryAddress, amountValue);
      await signAndSubmit(xdr, adminAddress);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Disbursement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disburse-modal-title"
      aria-describedby="disburse-modal-description"
    >
      <div className="glass p-8 rounded-3xl max-w-md w-full animate-fade-in">
        <h3 id="disburse-modal-title" className="text-2xl font-bold mb-2 text-center">Disburse Benefit</h3>
        <p id="disburse-modal-description" className="text-slate-400 text-center mb-6">
          Sending aid to <span className="text-white font-medium">{beneficiaryName}</span>
        </p>

        <div className="mb-6">
          <label htmlFor="disburse-amount" className="block text-sm font-medium text-slate-400 mb-1">Amount (XLM)</label>
          <div className="relative">
            <input
              id="disburse-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-2xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">XLM</div>
          </div>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDisburse}
            disabled={loading}
            className="flex-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {loading ? 'Processing...' : 'Confirm Disburse'}
          </button>
        </div>
      </div>
    </div>
  );
}
