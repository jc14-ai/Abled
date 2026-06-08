'use client';

import { useState } from 'react';
import { BeneficiaryRecord, BeneficiaryStatus, buildVerifyBeneficiaryXDR, buildRejectBeneficiaryXDR } from '@/lib/abled-contract';
import { signAndSubmit } from '@/lib/sign';
import { StatusBadge } from './StatusBadge';
import { DisburseModal } from './DisburseModal';

interface BeneficiaryRowProps {
  address: string;
  record: BeneficiaryRecord;
  adminAddress: string;
  onRefresh: () => void;
}

export function BeneficiaryRow({ address, record, adminAddress, onRefresh }: BeneficiaryRowProps) {
  const [loading, setLoading] = useState(false);
  const [showDisburse, setShowDisburse] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const xdr = await buildVerifyBeneficiaryXDR(adminAddress, address);
      await signAndSubmit(xdr, adminAddress);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const xdr = await buildRejectBeneficiaryXDR(adminAddress, address);
      await signAndSubmit(xdr, adminAddress);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-4">
        <div className="font-medium">{record.name}</div>
        <div className="text-xs text-slate-500 font-mono truncate max-w-[120px]">{address}</div>
      </td>
      <td className="py-4 px-4">
        <code className="text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800 block max-w-[140px] truncate overflow-hidden whitespace-nowrap">
          {record.disability_code}
        </code>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={record.status} />
      </td>
      <td className="py-4 px-4">
        <div className="text-sm">{(Number(record.total_received) / 10_000_000).toLocaleString()} XLM</div>
        <div className="text-[10px] text-slate-500">{record.disbursement_count} payments</div>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-2">
          {record.status === BeneficiaryStatus.Pending && (
            <>
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                aria-label="Verify beneficiary"
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-50 transition-all focus-visible:outline focus-visible:ring-2 focus-visible:ring-emerald-400/50"
                title="Verify"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                aria-label="Reject beneficiary"
                className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 transition-all focus-visible:outline focus-visible:ring-2 focus-visible:ring-rose-400/50"
                title="Reject"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          
          {record.status === BeneficiaryStatus.Verified && (
            <button
              onClick={() => setShowDisburse(true)}
              className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-xs font-bold"
            >
              Disburse
            </button>
          )}
        </div>
      </td>

      {showDisburse && (
        <DisburseModal
          adminAddress={adminAddress}
          beneficiaryAddress={address}
          beneficiaryName={record.name}
          onClose={() => setShowDisburse(false)}
          onSuccess={() => {
            setShowDisburse(false);
            onRefresh();
          }}
        />
      )}
    </tr>
  );
}
