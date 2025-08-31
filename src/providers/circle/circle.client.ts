import axios, { AxiosInstance } from 'axios';
import { env } from '@/config/env';

export interface CircleWallet {
  walletId: string;
  entityId: string;
  type: string;
  description?: string;
  balances: Array<{
    amount: string;
    currency: string;
  }>;
}

export interface CircleTransfer {
  id: string;
  source: {
    type: string;
    id: string;
  };
  destination: {
    type: string;
    address: string;
    chain: string;
  };
  amount: {
    amount: string;
    currency: string;
  };
  transactionHash?: string;
  status: string;
  createDate: string;
}

export class CircleClient {
  private client: AxiosInstance;

  constructor() {
    if (!env.CIRCLE_API_KEY) {
      throw new Error('CIRCLE_API_KEY is required for real Circle integration');
    }

    this.client = axios.create({
      baseURL: env.CIRCLE_BASE,
      headers: {
        'Authorization': `Bearer ${env.CIRCLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createWallet(userId: string): Promise<CircleWallet> {
    const response = await this.client.post('/v1/wallets', {
      idempotencyKey: `wallet-${userId}`,
      description: `Wallet for user ${userId}`,
    });

    return response.data.data;
  }

  async getWallet(walletId: string): Promise<CircleWallet> {
    const response = await this.client.get(`/v1/wallets/${walletId}`);
    return response.data.data;
  }

  async getBalance(walletId: string): Promise<string> {
    const wallet = await this.getWallet(walletId);
    const usdcBalance = wallet.balances.find(b => b.currency === 'USD');
    return usdcBalance?.amount || '0';
  }

  async createTransfer(params: {
    walletId: string;
    toAddress: string;
    amount: string;
    idempotencyKey: string;
  }): Promise<CircleTransfer> {
    const response = await this.client.post('/v1/transfers', {
      idempotencyKey: params.idempotencyKey,
      source: {
        type: 'wallet',
        id: params.walletId,
      },
      destination: {
        type: 'blockchain',
        address: params.toAddress,
        chain: 'ETH', // or 'MATIC' for Polygon
      },
      amount: {
        amount: params.amount,
        currency: 'USD',
      },
    });

    return response.data.data;
  }

  async getTransfer(transferId: string): Promise<CircleTransfer> {
    const response = await this.client.get(`/v1/transfers/${transferId}`);
    return response.data.data;
  }
}