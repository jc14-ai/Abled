'use client';

import { Role } from '@/hooks/useRole';

interface HeroLandingProps {
  onSelectRole: (role: Role) => void;
}

export function HeroLanding({ onSelectRole }: HeroLandingProps) {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="bg-mesh pointer-events-none">
        <div className="mesh-orb w-[600px] h-[600px] bg-primary top-[-100px] left-[-100px]" />
        <div className="mesh-orb w-[500px] h-[500px] bg-secondary bottom-[-100px] right-[-100px] delay-1000" />
        <div className="mesh-orb w-[400px] h-[400px] bg-accent top-[20%] right-[10%] opacity-10" />
      </div>

      {/* Navigation */}
      <nav role="navigation" aria-label="Main navigation" className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Return to top of page"
          className="flex items-center gap-2 group focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tighter">Abled</span>
        </button>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <div>
          <button 
            type="button"
            onClick={() => {
              document.getElementById('role-selection')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Scroll to role selection"
            className="px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700 transition-all shadow-xl focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Launch Portal
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-16 pb-24 text-center max-w-5xl mx-auto">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Powered by Stellar Blockchain
            </div>
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter mb-4 leading-none">
              Abled
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 text-gradient-primary">
              Aid Distribution Redefined.
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed">
              A decentralized platform empowering governments to disburse disability support with <span className="text-white font-medium">zero delays</span>, <span className="text-white font-medium">full transparency</span>, and <span className="text-white font-medium">total auditability</span>.
            </p>
            <div className="text-sm text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Demo-ready on Stellar Testnet: connect Freighter, fund your wallet with Friendbot, and run both administrator and beneficiary flows with no mainnet risk.
            </div>
          </div>

          <div id="role-selection" className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto animate-fade-in delay-200">
            <button
              onClick={() => onSelectRole('admin')}
              className="glass glass-hover p-10 rounded-[2.5rem] text-left group transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight">Government Portal</h3>
              <p className="text-slate-400 text-lg leading-snug mb-6">
                Register beneficiaries, verify credentials, and manage automated disbursement cycles.
              </p>
              <div className="flex items-center gap-2 text-secondary font-bold group-hover:translate-x-2 transition-transform">
                Enter Admin Portal
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('beneficiary')}
              className="glass glass-hover p-10 rounded-[2.5rem] text-left group transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tight">Beneficiary Hub</h3>
              <p className="text-slate-400 text-lg leading-snug mb-6">
                Securely link your wallet, submit your PWD code, and receive direct aid disbursements.
              </p>
              <div className="flex items-center gap-2 text-accent font-bold group-hover:translate-x-2 transition-transform">
                Access your aid
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-slate-900/30 border-y border-slate-800 py-16">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Total Disbursed', value: '$2.4M+' },
              { label: 'Registered Users', value: '12,000+' },
              { label: 'On-chain Records', value: '100%' },
              { label: 'Verification Speed', value: 'Instant' },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why Blockchain for Aid?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Traditional aid distribution is slow and prone to leakages. Abled fixes this using the Stellar network.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Immutable Proof',
                desc: 'Every disbursement is a permanent record on the ledger, making fraud virtually impossible.',
                icon: (
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: 'Instant Settlement',
                desc: 'Funds reach the beneficiary in 3-5 seconds. No bank delays, no middleman processing.',
                icon: (
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: 'Financial Inclusion',
                desc: 'Beneficiaries only need a mobile wallet. No traditional bank account required to receive support.',
                icon: (
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <div key={i} className="glass p-8 rounded-3xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 bg-slate-900/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
             <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient">How it Works</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-20">
              <div>
                <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-secondary text-white text-sm flex items-center justify-center font-bold">1</span>
                  For Government Admin
                </h3>
                <div className="space-y-12">
                  {[
                    { t: 'Register Identity', d: 'Securely login and establish your departmental credentials on the network.' },
                    { t: 'Verify Beneficiaries', d: 'Review submissions and verify PWD codes against the national registry.' },
                    { t: 'Automate Cycles', d: 'Set up periodic disbursement transactions that trigger automatically.' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-px h-auto bg-slate-800 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-secondary/50"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2 text-white">{step.t}</h4>
                        <p className="text-slate-400">{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-accent text-white text-sm flex items-center justify-center font-bold">2</span>
                  For Beneficiaries
                </h3>
                <div className="space-y-12">
                  {[
                    { t: 'Connect Wallet', d: 'Link your Stellar-compatible wallet (like Freighter) to the Abled portal.' },
                    { t: 'Submit Code', d: 'Provide your unique disability identification code for verification.' },
                    { t: 'Receive Aids', d: 'Funds are deposited directly into your wallet. Use them via any off-ramp.' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-px h-auto bg-slate-800 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent/50"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2 text-white">{step.t}</h4>
                        <p className="text-slate-400">{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Stellar Section */}
        <section id="security" className="py-32 px-8 max-w-5xl mx-auto text-center">
          <div className="glass p-16 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-secondary via-primary to-accent"></div>
            <h2 className="text-4xl font-bold mb-8">Bank-Grade Security</h2>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              Abled leverages the <strong>Stellar Consensus Protocol (SCP)</strong> to ensure every transaction is verified by a global network of nodes. Your data is protected by the same technology used by global financial institutions.
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholders for logos */}
               <div className="flex items-center gap-2 font-bold text-2xl text-white italic">STELLAR</div>
               <div className="flex items-center gap-2 font-bold text-2xl text-white">SOROBAN</div>
               <div className="flex items-center gap-2 font-bold text-2xl text-white tracking-widest uppercase">DSWD</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 pt-20 pb-12 px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Abled</span>
              </div>
              <p className="text-slate-500 max-w-sm mb-8">
                The future of disability aid distribution. Modernizing social support with transparency and efficiency on the Stellar blockchain.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.31.974.974 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.31 3.608-.974.974-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.31-.974-.974-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.31-3.608.974-.974 2.242-1.248 3.608-1.31 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-6">Platform</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Stellar Network</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6">Legal</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trust Center</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-slate-600">
            <p>© 2026 Abled — Social Aid on Blockchain. All rights reserved.</p>
            <p className="mt-2 italic">Disclaimer: This is a workshop prototype. Not for real-world disbursements.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
