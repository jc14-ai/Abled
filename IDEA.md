# Abled — Blockchain Disability Aid Distribution System

## Idea
- **Track:** Social Impact / Financial Inclusion
- **Idea #:** N/A
- **One-liner:** A Stellar-powered benefit disbursement platform replacing government delays with instant, traceable, on-chain payments.

## Problem
In the Philippines, DSWD disability benefit disbursements (like the PWD monthly stipend) often face 2–4 month delays due to manual verification, middleman banks, and paper-based tracking. Beneficiaries often lack traditional bank accounts, making "last-mile" delivery expensive and slow.

## How it uses Stellar
- **Soroban Smart Contracts**: Enforces eligibility, maintains a transparent registry of verified beneficiaries, and handles atomic disbursements.
- **XLM / Stablecoins (USDC)**: Used as the value transfer layer for instant settlement.
- **On-chain Events**: Provides a public, auditable trail of all government aid releases (Transparency).
- **Freighter Wallet**: Secure identity management for both DSWD officers (Admins) and beneficiaries.

## What works in the demo
- [x] Connect wallet (Freighter, testnet)
- [x] Dual-role dashboard (Admin vs Beneficiary)
- [x] Beneficiary self-registration with metadata (Name, PWD Code)
- [x] Admin-only verification and rejection flows
- [x] Instant XLM disbursement from contract to verified beneficiary
- [x] Real-time payment history and global disbursement stats

## Setup / run
- Network: **testnet**
- `cd web && npm install && npm run dev`
- Contract: `stellar contract build`, then `stellar contract deploy`
- Set `NEXT_PUBLIC_ABLED_CONTRACT_ID` in `web/.env.local`

## Demo
- 2–4 min video link: [To be added]
- Public repo link: [To be added]
