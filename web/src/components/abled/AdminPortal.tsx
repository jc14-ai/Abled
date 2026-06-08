'use client';

import { useState, useEffect } from 'react';
import { BeneficiaryRecord, getBeneficiary, getTotalDisbursed, isAdmin, abledContractConfigured, buildDisburseXDR, buildVerifyBeneficiaryXDR } from '@/lib/abled-contract';
import { BeneficiaryRow } from './BeneficiaryRow';
import { ABLED_CONTRACT_ID, fundTestnetAccount } from '@/lib/stellar';
import { signAndSubmit } from '@/lib/sign';
import { StatusBadge } from './StatusBadge';

const DEMO_ADMIN_ACCESS = process.env.NEXT_PUBLIC_DEMO_ADMIN === 'true';

interface AdminPortalProps {
  address: string;
}

export function AdminPortal({ address }: AdminPortalProps) {
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null);
  const [totalDisbursed, setTotalDisbursed] = useState<bigint>(0n);
  const [searchAddress, setSearchAddress] = useState('');
  const [activeBeneficiary, setActiveBeneficiary] = useState<{address: string, record: BeneficiaryRecord} | null>(null);
  const [registry, setRegistry] = useState<{address: string, record: BeneficiaryRecord}[]>([]);
  
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load registry from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('abled_registry');
    if (saved) {
      try {
        setRegistry(JSON.parse(saved, (key, value) => {
          if (typeof value === 'string' && /^\d+n$/.test(value)) {
            return BigInt(value.slice(0, -1));
          }
          return value;
        }));
      } catch (e) {
        console.error('Failed to parse registry');
      }
    }
  }, []);

  // Save registry to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('abled_registry', JSON.stringify(registry, (key, value) => {
      return typeof value === 'bigint' ? value.toString() + 'n' : value;
    }));
  }, [registry]);

  const checkAdmin = async () => {
    if (!abledContractConfigured()) return;
    if (DEMO_ADMIN_ACCESS) {
      setIsUserAdmin(true);
      return;
    }
    try {
      const isAdminUser = await isAdmin(address);
      setIsUserAdmin(isAdminUser);
    } catch (e) {
      console.warn('isAdmin check failed', e);
      setIsUserAdmin(false);
    }
  };

  const fetchStats = async () => {
    if (!abledContractConfigured()) return;
    const total = await getTotalDisbursed();
    setTotalDisbursed(total);
  };

  const refreshRegistry = async () => {
    const updated = await Promise.all(
      registry.map(async (item) => {
        try {
          const record = await getBeneficiary(item.address);
          return record ? { address: item.address, record } : item;
        } catch (e) {
          return item;
        }
      })
    );
    setRegistry(updated);
  };

  const handleFundContract = async () => {
    setFunding(true);
    setError(null);
    try {
      await fundTestnetAccount(ABLED_CONTRACT_ID);
      await new Promise(r => setTimeout(r, 2000));
      alert('Contract funded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to fund contract');
    } finally {
      setFunding(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress) return;
    setLoading(true);
    setError(null);
    try {
      const record = await getBeneficiary(searchAddress);
      if (record) {
        setActiveBeneficiary({ address: searchAddress, record });
        // Also add to history if not there
        if (!registry.find(r => r.address === searchAddress)) {
          setRegistry(prev => [{ address: searchAddress, record }, ...prev]);
        }
      } else {
        setError('Beneficiary not found');
        setActiveBeneficiary(null);
      }
    } catch (err) {
      setError('Invalid address or not registered');
      setActiveBeneficiary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!activeBeneficiary) return;
    const amountValue = parseFloat(amount);
    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      setError('Enter a valid disbursement amount greater than 0');
      return;
    }

    setDisbursing(true);
    setError(null);
    try {
      // 1. If pending, verify first (for demo efficiency)
      if (activeBeneficiary.record.status === 0) {
        const vXdr = await buildVerifyBeneficiaryXDR(address, activeBeneficiary.address);
        await signAndSubmit(vXdr, address);
      }

      // 2. Disburse
      const dXdr = await buildDisburseXDR(address, activeBeneficiary.address, amountValue);
      await signAndSubmit(dXdr, address);
      
      alert('Disbursement Successful!');
      
      // Refresh state
      fetchStats();
      const updated = await getBeneficiary(activeBeneficiary.address);
      if (updated) {
        setActiveBeneficiary({ address: activeBeneficiary.address, record: updated });
        setRegistry(prev => prev.map(r => r.address === activeBeneficiary.address ? { address: r.address, record: updated } : r));
      }
    } catch (err: any) {
      setError(err.message || 'Disbursement failed');
    } finally {
      setDisbursing(false);
    }
  };

  useEffect(() => {
    checkAdmin();
    fetchStats();
    refreshRegistry();
  }, [address]);

  if (!abledContractConfigured()) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="glass p-12 rounded-3xl">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Contract Not Deployed</h2>
          <p className="text-slate-400 mb-8">Deploy via <code>./scripts/deploy-abled.sh</code></p>
        </div>
      </div>
    );
  }

  if (isUserAdmin === false && !DEMO_ADMIN_ACCESS) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="glass p-12 rounded-3xl">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Unauthorized</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {DEMO_ADMIN_ACCESS && (
        <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-yellow-100">
          <strong className="font-bold">Demo Admin Mode:</strong> Admin access is always enabled for demo purposes. Transactions may still require the configured admin wallet to sign successfully.
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Distribution Hub</h2>
          <p className="text-slate-400 font-mono text-sm">Officer: {address.slice(0,8)}...{address.slice(-8)}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleFundContract}
            disabled={funding}
            className="glass px-6 py-4 rounded-2xl border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left"
          >
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Contract Wallet</div>
            <div className="text-xl font-bold text-emerald-400">{funding ? 'Funding...' : 'Fund XLM'}</div>
          </button>
          <div className="glass px-6 py-4 rounded-2xl border-primary/20 bg-primary/5">
            <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Total Distributed</div>
            <div className="text-2xl font-bold">{(Number(totalDisbursed) / 10_000_000).toLocaleString()} XLM</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Search & Direct Pay Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-6">Quick Send Payment</h3>
            <form onSubmit={handleSearch} className="flex gap-4 mb-8">
              <label htmlFor="beneficiary-search" className="sr-only">Beneficiary Address</label>
            <input
                id="beneficiary-search"
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                placeholder="Beneficiary Address (G...)"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Search'}
              </button>
            </form>

            {activeBeneficiary && (
              <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl animate-fade-in space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Found Beneficiary</div>
                    <h4 className="text-3xl font-bold">{activeBeneficiary.record.name}</h4>
                    <p className="text-slate-500 font-mono text-xs mt-1">{activeBeneficiary.address}</p>
                  </div>
                  <StatusBadge status={activeBeneficiary.record.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-2xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">PWD Code</div>
                    <div className="font-mono text-white truncate max-w-full overflow-hidden whitespace-nowrap">
                      {activeBeneficiary.record.disability_code}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-2xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Aids Received</div>
                    <div className="font-bold text-white">{(Number(activeBeneficiary.record.total_received) / 10_000_000).toLocaleString()} XLM</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <label className="block text-sm font-medium text-slate-400 mb-3">Disbursement Amount (XLM)</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-2xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">XLM</div>
                    </div>
                    <button
                      onClick={handleDisburse}
                      disabled={disbursing || !amount}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 text-lg"
                    >
                      {disbursing ? 'Processing...' : activeBeneficiary.record.status === 0 ? 'Verify & Send' : 'Send Payment'}
                    </button>
                  </div>
                  {error && <p className="text-rose-500 text-sm mt-4 font-medium px-2">⚠️ {error}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Column */}
        <div className="md:col-span-1">
          <div className="glass p-6 rounded-[2.5rem] h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent History</h3>
              <button 
                onClick={() => setRegistry([])}
                className="text-[10px] text-slate-500 hover:text-rose-500 font-bold uppercase tracking-widest"
              >
                Clear
              </button>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {registry.length > 0 ? (
                registry.map((item) => (
                  <button
                    key={item.address}
                    onClick={() => {
                      setActiveBeneficiary(item);
                      setSearchAddress('');
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      activeBeneficiary?.address === item.address 
                      ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/30' 
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold truncate">{item.record.name}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{item.address}</div>
                      <div className="text-xs font-bold text-slate-400">{(Number(item.record.total_received) / 10_000_000).toLocaleString()} XLM</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 italic text-sm">
                  History is empty.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
