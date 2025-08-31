import { CircleWallet, CircleTransfer } from './circle.client';

// In-memory simulation store
const wallets = new Map<string, CircleWallet>();
const transfers = new Map<string, CircleTransfer>();

export class CircleSimulation {
  async createWallet(userId: string): Promise<CircleWallet> {
    const walletId = `sim-wallet-${userId}`;
    
    const wallet: CircleWallet = {
      walletId,
      entityId: userId,
      type: 'end_user_wallet',
      description: `Simulated wallet for user ${userId}`,
      balances: [
        {
          amount: '1000.00', // Simulated starting balance
          currency: 'USD',
        },
      ],
    };

    wallets.set(walletId, wallet);
    return wallet;
  }

  async getWallet(walletId: string): Promise<CircleWallet> {
    const wallet = wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found in simulation`);
    }
    return wallet;
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
    const transferId = `sim-transfer-${Date.now()}`;
    
    const transfer: CircleTransfer = {
      id: transferId,
      source: {
        type: 'wallet',
        id: params.walletId,
      },
      destination: {
        type: 'blockchain',
        address: params.toAddress,
        chain: 'ETH',
      },
      amount: {
        amount: params.amount,
        currency: 'USD',
      },
      transactionHash: `0xsim${Date.now()}`,
      status: 'complete',
      createDate: new Date().toISOString(),
    };

    transfers.set(transferId, transfer);

    // Update wallet balance in simulation
    const wallet = await this.getWallet(params.walletId);
    const usdcBalance = wallet.balances.find(b => b.currency === 'USD');
    if (usdcBalance) {
      const newBalance = (parseFloat(usdcBalance.amount) - parseFloat(params.amount)).toString();
      usdcBalance.amount = Math.max(0, parseFloat(newBalance)).toString();
    }

    return transfer;
  }

  async getTransfer(transferId: string): Promise<CircleTransfer> {
    const transfer = transfers.get(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found in simulation`);
    }
    return transfer;
  }
}