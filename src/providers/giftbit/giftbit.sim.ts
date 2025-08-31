import { GiftbitCard, CardTopup } from './giftbit.client';

// In-memory simulation store
const cards = new Map<string, GiftbitCard>();
const topups = new Map<string, CardTopup>();

export class GiftbitSimulation {
  async issueCard(params: {
    userId: string;
    amount: string;
    expiryMonths?: number;
  }): Promise<GiftbitCard> {
    const cardId = `sim-card-${params.userId}-${Date.now()}`;
    
    // Generate simulated card details
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (params.expiryMonths || 12));
    const expiry = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(expiryDate.getFullYear()).slice(-2)}`;
    
    const card: GiftbitCard = {
      id: cardId,
      last4,
      expiry,
      balance: params.amount,
      status: 'ACTIVE',
      userId: params.userId,
    };

    cards.set(cardId, card);
    return card;
  }

  async getCard(cardId: string): Promise<GiftbitCard | null> {
    return cards.get(cardId) || null;
  }

  async topupCard(params: {
    cardId: string;
    amount: string;
  }): Promise<CardTopup> {
    const topupId = `sim-topup-${Date.now()}`;
    
    const topup: CardTopup = {
      id: topupId,
      cardId: params.cardId,
      amount: params.amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    topups.set(topupId, topup);

    // Update card balance in simulation
    const card = cards.get(params.cardId);
    if (card) {
      const newBalance = (parseFloat(card.balance) + parseFloat(params.amount)).toString();
      card.balance = newBalance;
    }

    return topup;
  }

  async getBalance(cardId: string): Promise<string> {
    const card = await this.getCard(cardId);
    return card?.balance || '0';
  }
}