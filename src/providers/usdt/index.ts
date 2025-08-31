// src/providers/usdt/index.ts

export type USDTClient = {
  getOrCreateWallet: (userId: string) => Promise<{ depositAddress: string }>;
  getBalance: (userId: string) => Promise<{ balance: string }>;

  // 现有 send
  send: (params: {
    userId: string;
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<{ txId?: string; status: 'SIMULATED' | 'PENDING' | 'COMPLETED' }>;

  // 兼容某些路由写法：createTransfer 当成 send 的别名
  createTransfer: (params: {
    userId: string;
    fromAddress?: string; // 某些实现会带 fromAddress，忽略即可
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<{ txId?: string; status: 'SIMULATED' | 'PENDING' | 'COMPLETED' }>;
};

export function getUSDTClient(): USDTClient {
  return simClient;
}

// ------- 模拟实现（可部署可运行） -------
const simBalances = new Map<string, number>(); // userId -> balance

const simClient: USDTClient = {
  async getOrCreateWallet(userId) {
    const suffix = userId.slice(0, 6).padEnd(6, 'x');
    return { depositAddress: `T-SIM-${suffix}-DEPOSIT` };
  },

  async getBalance(userId) {
    const n = simBalances.get(userId) ?? 0;
    return { balance: n.toFixed(2) };
  },

  async send({ userId, toAddress, amount }) {
    const amt = Math.max(0, Number(amount) || 0);
    const current = simBalances.get(userId) ?? 0;
    const next = Math.max(0, current - amt);
    simBalances.set(userId, next);

    const txId = `sim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    return { txId, status: 'SIMULATED' };
  },

  // 别名实现：转给 send
  async createTransfer(params) {
    return this.send(params);
  },
};
