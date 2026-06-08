'use client';

import { useState } from 'react';
import { buildRegisterBeneficiaryXDR } from '@/lib/abled-contract';
import { signAndSubmit } from '@/lib/sign';

interface RegisterFormProps {
  address: string;
  onSuccess: () => void;
}

export function RegisterForm({ address, onSuccess }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const xdr = await buildRegisterBeneficiaryXDR(address, name, code);
      await signAndSubmit(xdr, address);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl max-w-md w-full mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">Beneficiary Registration</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="beneficiary-name" className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
          <input
            id="beneficiary-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Juan Dela Cruz"
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-end mb-1">
            <label htmlFor="disability-code" className="block text-sm font-medium text-slate-400">Disability Code</label>
            <button 
              type="button"
              onClick={() => setCode(address)}
              aria-label="Use wallet address as disability code"
              className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Use Wallet Address
            </button>
          </div>
          <input
            id="disability-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-describedby="disability-code-help"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs"
            placeholder="PWD-XXX-XXX or Wallet Address"
            required
          />
          <p id="disability-code-help" className="mt-2 text-xs text-slate-500">
            Enter your PWD code or use the wallet address for demo registration.
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          {loading ? 'Submitting Registration...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}
