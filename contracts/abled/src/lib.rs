#![no_std]
//! Abled — Disability Aid Disbursement Contract
//!
//! Manages beneficiary registration, verification, and XLM disbursement
//! for DSWD disability support payments on the Stellar testnet.
//!
//! Flow:
//!   1. Admin registers a beneficiary (status = Pending)
//!   2. Admin verifies beneficiary after off-chain document check (status = Verified)
//!   3. Admin disburses XLM; contract enforces Verified status before transfer
//!
//! All state is stored in Persistent storage (survives archival).

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, String,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// The admin (DSWD officer) address.
    Admin,
    /// Per-beneficiary record keyed by their wallet address.
    Beneficiary(Address),
    /// Running total of all XLM disbursed (in stroops, i128).
    TotalDisbursed,
    /// Total number of registered beneficiaries.
    BeneficiaryCount,
}

// ─── Types ───────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Status {
    Pending = 0,
    Verified = 1,
    Rejected = 2,
}

#[contracttype]
#[derive(Clone)]
pub struct BeneficiaryRecord {
    /// Full name of the beneficiary (stored on-chain for transparency).
    pub name: String,
    /// Disability classification code (e.g., "PWD-001").
    pub disability_code: String,
    /// Verification status.
    pub status: Status,
    /// Total XLM received by this beneficiary (in stroops).
    pub total_received: i128,
    /// Ledger sequence of the last disbursement (0 = never disbursed).
    pub last_disbursement_ledger: u32,
    /// Count of disbursements received.
    pub disbursement_count: u32,
}

// ─── Errors ──────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AbledError {
    /// Caller is not the admin.
    Unauthorized = 1,
    /// Beneficiary already registered.
    AlreadyRegistered = 2,
    /// Beneficiary not found in registry.
    BeneficiaryNotFound = 3,
    /// Beneficiary is not Verified (cannot disburse to Pending/Rejected).
    NotVerified = 4,
    /// Disbursement amount must be > 0.
    InvalidAmount = 5,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct AbledContract;

#[contractimpl]
impl AbledContract {
    // ── Constructor ────────────────────────────────────────────────────────

    /// Deploy and set the admin in a single atomic transaction (Protocol 22+).
    pub fn __constructor(env: Env, admin: Address) {
        env.storage()
            .instance()
            .set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TotalDisbursed, &0i128);
        env.storage()
            .instance()
            .set(&DataKey::BeneficiaryCount, &0u32);
        env.storage().instance().extend_ttl(1_000, 518_400); // ~30 days
    }

    // ── Admin helpers ──────────────────────────────────────────────────────

    fn require_admin(env: &Env) -> Result<(), AbledError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();
        Ok(())
    }

    /// Read the current admin address.
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap()
    }

    /// Transfer the admin role to a new address (admin-only).
    pub fn set_admin(env: Env, new_admin: Address) -> Result<(), AbledError> {
        Self::require_admin(&env)?;
        env.storage()
            .instance()
            .set(&DataKey::Admin, &new_admin);
        env.storage().instance().extend_ttl(1_000, 518_400);
        Ok(())
    }

    // ── Beneficiary Management ─────────────────────────────────────────────

    /// Register a new beneficiary. Can be called by the beneficiary themselves
    /// (they sign) — the admin then verifies off-chain before approving.
    pub fn register_beneficiary(
        env: Env,
        beneficiary: Address,
        name: String,
        disability_code: String,
    ) -> Result<(), AbledError> {
        // Beneficiary must sign their own registration.
        beneficiary.require_auth();

        // Reject duplicates.
        if env
            .storage()
            .persistent()
            .has(&DataKey::Beneficiary(beneficiary.clone()))
        {
            return Err(AbledError::AlreadyRegistered);
        }

        let record = BeneficiaryRecord {
            name,
            disability_code,
            status: Status::Pending,
            total_received: 0,
            last_disbursement_ledger: 0,
            disbursement_count: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Beneficiary(beneficiary.clone()), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Beneficiary(beneficiary.clone()), 1_000, 518_400);

        // Increment beneficiary count.
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::BeneficiaryCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::BeneficiaryCount, &(count + 1));
        env.storage().instance().extend_ttl(1_000, 518_400);

        // Emit registration event.
        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "registered"), beneficiary),
            (),
        );

        Ok(())
    }

    /// Approve a pending beneficiary. Admin-only.
    pub fn verify_beneficiary(env: Env, beneficiary: Address) -> Result<(), AbledError> {
        Self::require_admin(&env)?;

        let mut record: BeneficiaryRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Beneficiary(beneficiary.clone()))
            .ok_or(AbledError::BeneficiaryNotFound)?;

        record.status = Status::Verified;
        env.storage()
            .persistent()
            .set(&DataKey::Beneficiary(beneficiary.clone()), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Beneficiary(beneficiary.clone()), 1_000, 518_400);

        env.events().publish(
            (soroban_sdk::symbol_short!("verified"), beneficiary),
            (),
        );

        Ok(())
    }

    /// Reject a pending/verified beneficiary. Admin-only.
    pub fn reject_beneficiary(env: Env, beneficiary: Address) -> Result<(), AbledError> {
        Self::require_admin(&env)?;

        let mut record: BeneficiaryRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Beneficiary(beneficiary.clone()))
            .ok_or(AbledError::BeneficiaryNotFound)?;

        record.status = Status::Rejected;
        env.storage()
            .persistent()
            .set(&DataKey::Beneficiary(beneficiary.clone()), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Beneficiary(beneficiary.clone()), 1_000, 518_400);

        env.events().publish(
            (soroban_sdk::symbol_short!("rejected"), beneficiary),
            (),
        );

        Ok(())
    }

    // ── Disbursement ───────────────────────────────────────────────────────

    /// Disburse XLM to a verified beneficiary.
    ///
    /// `token_contract` — the XLM SAC address (or any SEP-41 token).
    /// `amount`         — in stroops (1 XLM = 10_000_000 stroops).
    ///
    /// The contract itself must hold enough token balance before this is called.
    /// Admin pre-funds the contract, then disbursements pull from it.
    pub fn disburse(
        env: Env,
        token_contract: Address,
        beneficiary: Address,
        amount: i128,
    ) -> Result<(), AbledError> {
        Self::require_admin(&env)?;

        if amount <= 0 {
            return Err(AbledError::InvalidAmount);
        }

        let mut record: BeneficiaryRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Beneficiary(beneficiary.clone()))
            .ok_or(AbledError::BeneficiaryNotFound)?;

        if record.status != Status::Verified {
            return Err(AbledError::NotVerified);
        }

        // Transfer tokens from the contract's own balance to the beneficiary.
        let token = token::Client::new(&env, &token_contract);
        token.transfer(
            &env.current_contract_address(),
            &beneficiary,
            &amount,
        );

        // Update record.
        record.total_received += amount;
        record.last_disbursement_ledger = env.ledger().sequence();
        record.disbursement_count += 1;
        env.storage()
            .persistent()
            .set(&DataKey::Beneficiary(beneficiary.clone()), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Beneficiary(beneficiary.clone()), 1_000, 518_400);

        // Update global total.
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDisbursed)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDisbursed, &(total + amount));
        env.storage().instance().extend_ttl(1_000, 518_400);

        // Emit disbursement event.
        env.events().publish(
            (soroban_sdk::symbol_short!("disbursed"), beneficiary),
            amount,
        );

        Ok(())
    }

    // ── Read Functions ─────────────────────────────────────────────────────

    /// Get a beneficiary's record by wallet address.
    pub fn get_beneficiary(
        env: Env,
        beneficiary: Address,
    ) -> Result<BeneficiaryRecord, AbledError> {
        env.storage()
            .persistent()
            .get(&DataKey::Beneficiary(beneficiary))
            .ok_or(AbledError::BeneficiaryNotFound)
    }

    /// Total XLM disbursed by this contract across all beneficiaries.
    pub fn get_total_disbursed(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalDisbursed)
            .unwrap_or(0)
    }

    /// Total number of registered beneficiaries.
    pub fn get_beneficiary_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::BeneficiaryCount)
            .unwrap_or(0)
    }

    /// Check if an address is the admin.
    pub fn is_admin(env: Env, address: Address) -> bool {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin == address
    }
}

mod test;
