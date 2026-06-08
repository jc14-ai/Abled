import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Account,
  rpc,
  nativeToScVal,
  scValToNative,
  Address,
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE, ABLED_CONTRACT_ID, XLM_SAC } from './stellar';

const READ_SOURCE = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export enum BeneficiaryStatus {
  Pending = 0,
  Verified = 1,
  Rejected = 2,
}

export interface BeneficiaryRecord {
  name: string;
  disability_code: string;
  status: BeneficiaryStatus;
  total_received: bigint;
  last_disbursement_ledger: number;
  disbursement_count: number;
}

export function abledContractConfigured(): boolean {
  return Boolean(ABLED_CONTRACT_ID);
}

function ensureContractConfigured() {
  if (!ABLED_CONTRACT_ID) {
    throw new Error('NEXT_PUBLIC_ABLED_CONTRACT_ID is not configured in environment variables.');
  }
}

export async function getBeneficiary(address: string): Promise<BeneficiaryRecord | null> {
  ensureContractConfigured();
  const contract = new Contract(ABLED_CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('get_beneficiary', new Address(address).toScVal()))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    return null;
  }

  return scValToNative(sim.result.retval) as BeneficiaryRecord;
}

export async function getTotalDisbursed(): Promise<bigint> {
  ensureContractConfigured();
  const contract = new Contract(ABLED_CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('get_total_disbursed'))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) return 0n;

  return scValToNative(sim.result.retval) as bigint;
}

export async function isAdmin(address: string): Promise<boolean> {
  ensureContractConfigured();
  const contract = new Contract(ABLED_CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('is_admin', new Address(address).toScVal()))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) return false;

  return scValToNative(sim.result.retval) as boolean;
}

export async function buildRegisterBeneficiaryXDR(
  sender: string,
  name: string,
  disabilityCode: string,
): Promise<string> {
  ensureContractConfigured();
  const contract = new Contract(ABLED_CONTRACT_ID);
  const account = await server.getAccount(sender);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'register_beneficiary',
        new Address(sender).toScVal(),
        nativeToScVal(name, { type: 'string' }),
        nativeToScVal(disabilityCode, { type: 'string' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — could not register.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

export async function buildVerifyBeneficiaryXDR(
  admin: string,
  beneficiary: string,
): Promise<string> {
  ensureContractConfigured();
  const contract = new Contract(ABLED_CONTRACT_ID);
  const account = await server.getAccount(admin);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call('verify_beneficiary', new Address(beneficiary).toScVal()),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — only admin can verify.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

export async function buildRejectBeneficiaryXDR(
  admin: string,
  beneficiary: string,
): Promise<string> {
  ensureContractConfigured();
  const contract = new Contract(ABLED_CONTRACT_ID);
  const account = await server.getAccount(admin);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call('reject_beneficiary', new Address(beneficiary).toScVal()),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — only admin can reject.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

export async function buildDisburseXDR(
  admin: string,
  beneficiary: string,
  amountXLM: number,
): Promise<string> {
  ensureContractConfigured();
  if (!Number.isFinite(amountXLM) || amountXLM <= 0) {
    throw new Error('Amount must be a positive number.');
  }

  const contract = new Contract(ABLED_CONTRACT_ID);
  const account = await server.getAccount(admin);
  
  // Convert XLM to stroops (i128)
  const amountStroops = BigInt(Math.trunc(amountXLM * 10_000_000));
  if (amountStroops <= 0n) {
    throw new Error('Amount must convert to a positive stroop value.');
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'disburse',
        new Address(XLM_SAC).toScVal(),
        new Address(beneficiary).toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — check admin auth, status, and contract balance.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

