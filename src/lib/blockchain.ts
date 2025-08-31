// src/lib/blockchain.ts
import { ethers } from 'ethers';
import {
  Client,
  Wallet as XRPLWallet,
  Payment,
  xrpToDrops,
  dropsToXrp,
} from 'xrpl';
import { env } from '@/config/env';
import { encryptJson, decryptJson } from '@/utils/kms';

export interface WalletKeys {
  ethPrivateKey: string;
  ethAddress: string;
  xrpSeed: string;
  xrpAddress: string;
}

export async function generateWalletKeys(): Promise<{
  keys: WalletKeys;
  encryptedData: string;
}> {
  const ethWallet = ethers.Wallet.createRandom();
  const xrpWallet = XRPLWallet.generate();

  const keys: WalletKeys = {
    ethPrivateKey: ethWallet.privateKey,
    ethAddress: ethWallet.address,
    xrpSeed: xrpWallet.seed!,
    xrpAddress: xrpWallet.address,
  };

  const encryptedData = encryptJson(keys);
  return { keys, encryptedData };
}

export function decryptWalletKeys(encryptedData: string): WalletKeys {
  return decryptJson<WalletKeys>(encryptedData);
}

export function maskAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function getETHBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(
      env.ETH_NETWORK === 'mainnet'
        ? 'https://eth-mainnet.alchemyapi.io/v2/demo'
        : 'https://eth-sepolia.g.alchemy.com/v2/demo'
    );
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0';
  }
}

export async function getXRPBalance(address: string): Promise<string> {
  const client = new Client(
    env.XRPL_NETWORK === 'mainnet'
      ? 'wss://xrplcluster.com'
      : 'wss://s.altnet.rippletest.net:51233'
  );

  try {
    await client.connect();
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });
    await client.disconnect();

    return dropsToXrp(response.result.account_data.Balance);
  } catch (error) {
    console.error('Error fetching XRP balance:', error);
    return '0';
  }
}

export async function sendXRP(params: {
  seed: string;
  toAddress: string;
  amount: string;
}): Promise<{ txHash: string; status: string }> {
  const client = new Client(
    env.XRPL_NETWORK === 'mainnet'
      ? 'wss://xrplcluster.com'
      : 'wss://s.altnet.rippletest.net:51233'
  );

  try {
    await client.connect();

    const wallet = XRPLWallet.fromSeed(params.seed);

    const payment: Payment = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Amount: xrpToDrops(String(params.amount)),
      Destination: params.toAddress,
    };

    const prepared = await client.autofill(payment);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    await client.disconnect();

    // 兼容不同 xrpl 版本的返回结构
    const txHash =
      (result as any).result?.hash ||
      (result as any).tx_json?.hash ||
      signed.hash;

    const status =
      (result as any).result?.meta?.TransactionResult ||
      (result as any).meta?.TransactionResult ||
      'unknown';

    return { txHash, status };
  } catch (error) {
    console.error('Error sending XRP:', error);
    throw error;
  }
}
