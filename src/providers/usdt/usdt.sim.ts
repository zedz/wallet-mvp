import { USDTWallet, USDTTransfer } from './usdt.client';

// In-memory simulation store
const wallets = new Map<string, USDTWallet>();
const transfers = new Map<string, USDTTransfer>();

export class USDTSimulation {
  async createWallet(userId: string): Promise<USDTWallet> {
    const address = `usdt-sim-${userId}-${Date.now()}`;
    
    const wallet: USDTWallet = {
      address,
      balance: '500.00', // Simulated starting balance
      userId,
    };

    wallets.set(address, wallet);
    return wallet;
  }

  async getBalance(address: string): Promise<string> {
    const wallet = wallets.get(address);
    return wallet?.balance || '0';
  }

  async createTransfer(params: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    userId: string;
  }): Promise<USDTTransfer> {
    const transferId = `usdt-sim-transfer-${Date.now()}`;
    
    const transfer: USDTTransfer = {
      id: transferId,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      amount: params.amount,
      txHash: `0xusdt${Date.now()}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    transfers.set(transferId, transfer);

    // Update wallet balance in simulation
    const wallet = wallets.get(params.fromAddress);
    if (wallet) {
      const newBalance = (parseFloat(wallet.balance) - parseFloat(params.amount)).toString();
      wallet.balance = Math.max(0, parseFloat(newBalance)).toString();
    }

    return transfer;
  }

  async getTransfer(transferId: string): Promise<USDTTransfer | null> {
    return transfers.get(transferId) || null;
  }
}