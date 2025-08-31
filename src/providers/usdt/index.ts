// src/providers/usdt/index.ts

export type USDTClient = {
  /** 为用户创建或获取充币地址（模拟版） */
  getOrCreateWallet: (userId: string) => Promise<{ depositAddress: string }>;

  /** 查询余额（字符串，单位 USDT） */
  getBalance: (userId: string) => Promise<{ balance: string }>;

  /** 发送 USDT（模拟实现） */
  send: (params: {
    userId: string;
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<{ txId?: string; txHash?: string; status: 'SIMULATED' | 'PENDING' | 'COMPLETED' }>;

  /** createTransfer: send 的别名，保持和 route.ts 的兼容 */
  createTransfer: (params: {
    userId: string;
    fromAddress?: string;
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<{ txId?: string; txHash?: string; status: 'SIMULATED' | 'PENDING' | 'COMPLETED' }>;
};

/**
 * 生产 USDT 客户端。
 * 默认返回模拟实现，便于 Vercel 部署和前端跑通。
 * 将来接真 API 时可以在这里切换。
 */
export function getUSDTClient(): USDTClient {
  return simClient;
}

// ------- 模拟实现 -------

const simBalances = new Map<string, number>(); // userId -> balance

const simClient: USDTClient = {
  async getOrCreateWallet(userId) {
    const suffix = userId.slice(0, 6).padEnd(6, 'x');
    return { depositAddress: `T-SIM-${suffix}-ADDR` };
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

    const txId = `sim_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // 同时返回 txId 和 txHash（别名），兼容前端/路由两种写法
    return { txId, txHash: txId, status: 'SIMULATED' };
  },

  async createTransfer(params) {
    return this.send(params);
  },
};
