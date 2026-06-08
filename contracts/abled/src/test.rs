#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env, String,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

fn setup_env() -> (Env, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(AbledContract, (&admin,));

    (env, admin, contract_id)
}

fn make_xlm_token<'a>(env: &'a Env, admin: &Address) -> (Address, StellarAssetClient<'a>) {
    let sac_address = env.register_stellar_asset_contract_v2(admin.clone());
    let sac_client = StellarAssetClient::new(env, &sac_address.address());
    (sac_address.address(), sac_client)
}

fn sample_name(env: &Env) -> String {
    String::from_str(env, "Juan dela Cruz")
}

fn sample_code(env: &Env) -> String {
    String::from_str(env, "PWD-001")
}

// ─── Registration ─────────────────────────────────────────────────────────────

#[test]
fn test_register_beneficiary() {
    let (env, _admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));

    let record = client.get_beneficiary(&beneficiary);
    assert_eq!(record.status, Status::Pending);
    assert_eq!(record.total_received, 0);
    assert_eq!(record.disbursement_count, 0);
}

#[test]
fn test_register_duplicate_fails() {
    let (env, _admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));

    let err = client
        .try_register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env))
        .unwrap_err()
        .unwrap();
    assert_eq!(err, AbledError::AlreadyRegistered.into());
}

// ─── Verification ─────────────────────────────────────────────────────────────

#[test]
fn test_verify_beneficiary() {
    let (env, _admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    client.verify_beneficiary(&beneficiary);

    let record = client.get_beneficiary(&beneficiary);
    assert_eq!(record.status, Status::Verified);
}

#[test]
fn test_reject_beneficiary() {
    let (env, _admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    client.reject_beneficiary(&beneficiary);

    let record = client.get_beneficiary(&beneficiary);
    assert_eq!(record.status, Status::Rejected);
}

#[test]
fn test_verify_nonexistent_fails() {
    let (env, _admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let random = Address::generate(&env);
    let err = client
        .try_verify_beneficiary(&random)
        .unwrap_err()
        .unwrap();
    assert_eq!(err, AbledError::BeneficiaryNotFound.into());
}

// ─── Disbursement ─────────────────────────────────────────────────────────────

#[test]
fn test_disburse_to_verified_beneficiary() {
    let (env, admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    // Mint some XLM into the contract.
    let (token_addr, sac) = make_xlm_token(&env, &admin);
    sac.mint(&contract_id, &10_000_000_000); // 1000 XLM

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    client.verify_beneficiary(&beneficiary);

    let disburse_amount = 500_000_000i128; // 50 XLM
    client.disburse(&token_addr, &beneficiary, &disburse_amount);

    let record = client.get_beneficiary(&beneficiary);
    assert_eq!(record.total_received, disburse_amount);
    assert_eq!(record.disbursement_count, 1);

    let token_client = TokenClient::new(&env, &token_addr);
    assert_eq!(token_client.balance(&beneficiary), disburse_amount);

    let total = client.get_total_disbursed();
    assert_eq!(total, disburse_amount);
}

#[test]
fn test_disburse_to_pending_fails() {
    let (env, admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let (token_addr, sac) = make_xlm_token(&env, &admin);
    sac.mint(&contract_id, &10_000_000_000);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    // Do NOT verify — status = Pending

    let err = client
        .try_disburse(&token_addr, &beneficiary, &500_000_000)
        .unwrap_err()
        .unwrap();
    assert_eq!(err, AbledError::NotVerified.into());
}

#[test]
fn test_disburse_to_rejected_fails() {
    let (env, admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let (token_addr, sac) = make_xlm_token(&env, &admin);
    sac.mint(&contract_id, &10_000_000_000);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    client.reject_beneficiary(&beneficiary);

    let err = client
        .try_disburse(&token_addr, &beneficiary, &500_000_000)
        .unwrap_err()
        .unwrap();
    assert_eq!(err, AbledError::NotVerified.into());
}

#[test]
fn test_disburse_zero_amount_fails() {
    let (env, admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let (token_addr, sac) = make_xlm_token(&env, &admin);
    sac.mint(&contract_id, &10_000_000_000);

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    client.verify_beneficiary(&beneficiary);

    let err = client
        .try_disburse(&token_addr, &beneficiary, &0)
        .unwrap_err()
        .unwrap();
    assert_eq!(err, AbledError::InvalidAmount.into());
}

// ─── Admin ────────────────────────────────────────────────────────────────────

#[test]
fn test_is_admin() {
    let (env, admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    assert!(client.is_admin(&admin));
    let random = Address::generate(&env);
    assert!(!client.is_admin(&random));
}

#[test]
fn test_beneficiary_count() {
    let (env, _admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    assert_eq!(client.get_beneficiary_count(), 0);

    let b1 = Address::generate(&env);
    let b2 = Address::generate(&env);
    client.register_beneficiary(&b1, &sample_name(&env), &sample_code(&env));
    client.register_beneficiary(&b2, &sample_name(&env), &sample_code(&env));

    assert_eq!(client.get_beneficiary_count(), 2);
}

#[test]
fn test_multiple_disbursements_accumulate() {
    let (env, admin, contract_id) = setup_env();
    let client = AbledContractClient::new(&env, &contract_id);

    let (token_addr, sac) = make_xlm_token(&env, &admin);
    sac.mint(&contract_id, &100_000_000_000); // 10000 XLM

    let beneficiary = Address::generate(&env);
    client.register_beneficiary(&beneficiary, &sample_name(&env), &sample_code(&env));
    client.verify_beneficiary(&beneficiary);

    let amount = 500_000_000i128; // 50 XLM each
    client.disburse(&token_addr, &beneficiary, &amount);
    client.disburse(&token_addr, &beneficiary, &amount);
    client.disburse(&token_addr, &beneficiary, &amount);

    let record = client.get_beneficiary(&beneficiary);
    assert_eq!(record.total_received, amount * 3);
    assert_eq!(record.disbursement_count, 3);
    assert_eq!(client.get_total_disbursed(), amount * 3);
}
