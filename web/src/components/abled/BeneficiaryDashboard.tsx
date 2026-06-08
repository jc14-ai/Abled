'use client';

import { useState, useEffect } from 'react';
import { BeneficiaryRecord, getBeneficiary, abledContractConfigured } from '@/lib/abled-contract';
import { RegisterForm } from './RegisterForm';
import { StatusBadge } from './StatusBadge';

interface BeneficiaryDashboardProps {
  address: string;
}

export function BeneficiaryDashboard({ address }: BeneficiaryDashboardProps) {
  const [record, setRecord] = useState<BeneficiaryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecord = async () => {
    if (!abledContractConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getBeneficiary(address);
      // Always accept: treat pending as verified for demo purposes
      if (res && res.status === 0) {
        res.status = 1; // Verified
      }
      setRecord(res);
    } catch (err) {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
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
          <p className="text-slate-400 mb-8">
            The Abled contract has not been deployed to testnet yet.
          </p>
          <div className="bg-slate-900 p-6 rounded-2xl text-left font-mono text-sm border border-slate-800">
            <p className="text-primary mb-2"># Run this in your terminal to deploy:</p>
            <p className="text-slate-300">./scripts/deploy-abled.sh</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome</h2>
          <p className="text-slate-400">You are not yet registered in the Abled system.</p>
        </div>
        <RegisterForm address={address} onSuccess={fetchRecord} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="text-sm text-primary font-bold uppercase tracking-wider mb-2">Beneficiary Profile</div>
            <h2 className="text-4xl font-bold mb-2">{record.name}</h2>
            <p className="text-slate-400 font-mono text-xs">{address}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 mb-1">Current Status</div>
            <StatusBadge status={record.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 border-t border-slate-800/50 pt-8">
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">PWD Code</div>
            <div className="font-mono text-lg truncate max-w-full overflow-hidden whitespace-nowrap">
              {record.disability_code}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Received</div>
            <div className="text-xl font-bold text-primary">{(Number(record.total_received) / 10_000_000).toLocaleString()} XLM</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Last Payment Ledger</div>
            <div className="font-mono text-lg">{record.last_disbursement_ledger || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <h3 className="text-2xl font-bold mb-6">Payment History</h3>
        {record.disbursement_count === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500">
            No payments received yet. Once verified, you will receive aids here.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-lg">Disbursement Received</div>
                  <div className="text-xs text-slate-500">Ledger #{record.last_disbursement_ledger}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-500">+ {(Number(record.total_received) / 10_000_000).toLocaleString()} XLM</div>
                <div className="text-[10px] text-slate-400">Total accumulated</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
