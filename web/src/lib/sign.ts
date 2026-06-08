import { NETWORK_PASSPHRASE } from './stellar';
import { submitSignedXDR, pollTransaction } from './payment';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

/**
 * Sign an unsigned XDR, submit it, and poll to finality.
 * If the address matches the ADMIN_SECRET in env, it signs automatically.
 * Otherwise, it uses Freighter.
 */
export async function signAndSubmit(xdr: string, address: string): Promise<string> {
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  let signedXdr: string;

  if (adminSecret) {
    try {
      const adminKeypair = Keypair.fromSecret(adminSecret);
      if (adminKeypair.publicKey() === address) {
        console.log('Admin detected: Auto-signing transaction...');
        const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
        tx.sign(adminKeypair);
        signedXdr = tx.toXDR();
      } else {
        signedXdr = await signWithFreighter(xdr, address);
      }
    } catch (e) {
      console.warn('Failed to auto-sign with admin secret:', e);
      signedXdr = await signWithFreighter(xdr, address);
    }
  } else {
    signedXdr = await signWithFreighter(xdr, address);
  }

  const hash = await submitSignedXDR(signedXdr);
  await pollTransaction(hash);
  return hash;
}

async function signWithFreighter(xdr: string, address: string): Promise<string> {
  // Dynamic import only — static import of freighter-api breaks SSR.
  const freighter = await import('@stellar/freighter-api');
  const signed = await freighter.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  if (signed.error) {
    throw new Error(
      typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
    );
  }
  return signed.signedTxXdr;
}
