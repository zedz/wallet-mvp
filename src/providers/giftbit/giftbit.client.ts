import axios, { AxiosInstance } from 'axios';
import { env } from '@/config/env';

export interface GiftbitCard {
  id: string;
  last4: string;
  expiry: string; // MM/YY format
  balance: string;
  status: string;
  userId: string;
}

export interface CardTopup {
  id: string;
  cardId: string;
  amount: string;
  status: string;
  createdAt: string;
}

export class GiftbitClient {
  private client: AxiosInstance;

  constructor() {
    if (!env.GIFTBIT_API_KEY || !env.GIFTBIT_API_BASE) {
      throw new Error('GIFTBIT_API_KEY and GIFTBIT_API_BASE are required for real Giftbit integration');
    }

    this.client = axios.create({
      baseURL: env.GIFTBIT_API_BASE,
      headers: {
        'Authorization': `Bearer ${env.GIFTBIT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async issueCard(params: {
    userId: string;
    amount: string;
    expiryMonths?: number;
  }): Promise<GiftbitCard> {
    const response = await this.client.post('/cards/issue', {
      user_id: params.userId,
      amount: params.amount,
      expiry_months: params.expiryMonths || 12,
      currency: 'USD',
    });

    return {
      id: response.data.card_id,
      last4: response.data.last_four,
      expiry: response.data.expiry,
      balance: response.data.balance,
      status: response.data.status,
      userId: params.userId,
    };
  }

  async getCard(cardId: string): Promise<GiftbitCard | null> {
    try {
      const response = await this.client.get(`/cards/${cardId}`);
      return {
        id: cardId,
        last4: response.data.last_four,
        expiry: response.data.expiry,
        balance: response.data.balance,
        status: response.data.status,
        userId: response.data.user_id,
      };
    } catch (error) {
      return null;
    }
  }

  async topupCard(params: {
    cardId: string;
    amount: string;
  }): Promise<CardTopup> {
    const response = await this.client.post(`/cards/${params.cardId}/topup`, {
      amount: params.amount,
    });

    return {
      id: response.data.topup_id,
      cardId: params.cardId,
      amount: params.amount,
      status: response.data.status,
      createdAt: new Date().toISOString(),
    };
  }

  async getBalance(cardId: string): Promise<string> {
    const card = await this.getCard(cardId);
    return card?.balance || '0';
  }
}