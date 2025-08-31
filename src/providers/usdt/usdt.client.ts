import axios, { AxiosInstance } from 'axios';
import { env } from '@/config/env';

export interface USDTWallet {
  address: string;
  balance: string;
  userId: string;
}

export interface USDTTransfer {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  txHash?: string;
  status: string;
  createdAt: string;
}

export class USDTClient {
  private client: AxiosInstance;

  constructor() {
    if (!env.USDT_API_KEY || !env.USDT_API_BASE) {
      throw new Error('USDT_API_KEY and USDT_API_BASE are required for real USDT integration');
    }

    this.client = axios.create({
      baseURL: env.USDT_API_BASE,
      headers: {
        'Authorization': `Bearer ${env.USDT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createWallet(userId: string): Promise<USDTWallet> {
    const response = await this.client.post('/wallet/create', {
      user_id: userId,
      currency: 'USDT',
    });

    return {
      address: response.data.address,
      balance: response.data.balance || '0',
      userId,
    };
  }

  async getBalance(address: string): Promise<string> {
    const response = await this.client.get(`/wallet/balance/${address}`);
    return response.data.balance || '0';
  }

  async createTransfer(params: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    userId: string;
  }): Promise<USDTTransfer> {
    const response = await this.client.post('/transaction/send', {
      from_address: params.fromAddress,
      to_address: params.toAddress,
      amount: params.amount,
      currency: 'USDT',
    });

    return {
      id: response.data.transaction_id,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      amount: params.amount,
      txHash: response.data.tx_hash,
      status: response.data.status,
      createdAt: new Date().toISOString(),
    };
  }

  async getTransfer(transferId: string): Promise<USDTTransfer | null> {
    try {
      const response = await this.client.get(`/transaction/${transferId}`);
      return {
        id: transferId,
        fromAddress: response.data.from_address,
        toAddress: response.data.to_address,
        amount: response.data.amount,
        txHash: response.data.tx_hash,
        status: response.data.status,
        createdAt: response.data.created_at,
      };
    } catch (error) {
      return null;
    }
  }
}