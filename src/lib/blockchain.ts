// src/lib/blockchain.ts
import { ethers } from 'ethers';
import {
  Client,
  Wallet as XRPLWallet,
  Payment,            // ✅ 新增：显式使用 Payment 类型
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
  // Generate Ethereum wallet
  const ethWallet = ethers.Wallet.createRandom();

  // Generate XRP wallet
  const xrpWallet = XRPLWallet.generate();

  const keys: WalletKeys = {
    ethPrivateKey: ethWallet.privateKey,
    ethAddress: ethWallet.address,
    xrpSeed: xrpWallet.seed!,
    xrpAddress: xrpWallet.address, // 在 xrpl 当前版本中，address 即 classic address
  };

  // Encrypt the sensitive data
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
  amount: string; // 单位 XRP（字符串）
}): Promise<{ txHash: string; status: string }> {
  const client = new Client(
    env.XRPL_NETWORK === 'mainnet'
      ? 'wss://xrplcluster.com'
      : 'wss://s.altnet.rippletest.net:51233'
  );

  try {
    await client.connect();

    const wallet = XRPLWallet.fromSeed(params.seed);

    // ✅ 关键修复：显式标注为 Payment；Amount 必须是 drops 字符串
    const payment: Payment = {
      TransactionType: 'Payment',
      Account: wallet.address,                         // 或 wallet.classicAddress
      Amount: xrpToDrops(String(params.amount)),       // "1.5" XRP -> "1500000" drops
      Destination: params.toAddress,
    };

    const prepared = await client.autofill(payment);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    await client.disconnect();

    // ✅ 兼容不同 xrpl 版本返回结构的取哈希方式
    const txHash =
      // @ts-expect-error: shape may differ across versions
      result.result?.hash ||
      // @ts-expect-error: shape may differ across versions
      result.tx_json?.hash ||
      signed.hash;

    const status =
      // @ts-expect-error: shape may differ across versions
      result.result?.meta?.TransactionResult ||
      // @ts-expect-error: shape may differ across versions
      result.meta?.TransactionResult ||
      'unknown';

    return { txHash, status };
  } catch (error) {
    console.error('Error sending XRP:', error);
    throw error;
  }
}
