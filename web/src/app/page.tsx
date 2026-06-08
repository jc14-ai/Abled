'use client';

import { useWallet } from '@/hooks/useWallet';
import { useRole, Role } from '@/hooks/useRole';
import { HeroLanding } from '@/components/abled/HeroLanding';
import { AdminPortal } from '@/components/abled/AdminPortal';
import { BeneficiaryDashboard } from '@/components/abled/BeneficiaryDashboard';
import ConnectWallet from '@/components/ConnectWallet';

interface HeaderProps {
  role: Role;
  publicKey: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  onLogoClick: () => void;
}

const Header = ({ 
  role, 
  publicKey, 
  connecting, 
  error, 
  connect, 
  disconnect, 
  onLogoClick 
}: HeaderProps) => (
  <header className="glass sticky top-0 z-40 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-slate-800/50">
    <button
      type="button"
      onClick={onLogoClick}
      aria-label="Return to landing page"
      className="flex items-center gap-2 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight">Abled</span>
    </button>
    <div className="flex items-center gap-4">
      {publicKey && (
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            Connected as {role}
          </span>
          <span className="text-xs font-mono text-slate-300">
            {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
          </span>
        </div>
      )}
      <ConnectWallet
        publicKey={publicKey}
        connecting={connecting}
        error={error}
        connect={connect}
        disconnect={disconnect}
      />
      {publicKey && (
        <button 
          onClick={disconnect}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Disconnect"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      )}
    </div>
  </header>
);

export default function Home() {
  const { publicKey, connecting, error, connect, disconnect } = useWallet();
  const { role, selectRole } = useRole();

  // 1. Landing state: No role selected
  if (!role) {
    return (
      <main className="flex-1">
        <HeroLanding onSelectRole={selectRole} />
      </main>
    );
  }

  // 3. Main content based on role
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <Header 
        role={role}
        publicKey={publicKey}
        connecting={connecting}
        error={error}
        connect={connect}
        disconnect={disconnect}
        onLogoClick={() => selectRole(null)}
      />
      
      {!publicKey ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="glass p-12 rounded-3xl text-center max-w-lg">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-8">
              To access the {role} portal, you need to connect your Stellar wallet via Freighter.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {role === 'admin' ? (
            <AdminPortal address={publicKey} />
          ) : (
            <BeneficiaryDashboard address={publicKey} />
          )}
        </div>
      )}

      <footer className="py-8 px-6 text-center text-slate-600 text-xs mt-auto">
        <p>© 2026 Abled — Decentralized Disability Aid Distribution. Built on Stellar.</p>
      </footer>
    </main>
  );
}
