// src/providers/usdt/index.ts

export type USDTClient = {
  /** 为用户创建/获取充币地址（演示用） */
  getOrCreateWallet: (userId: string) => Promise<{ depositAddress: string }>;
  /** 查询余额（字符串，单位 USDT） */
  getBalance: (userId: string) => Promise<{ balance: string }>;
  /** 发送 USDT（演示用：返回模拟 txId 与状态） */
  send: (params: {
    userId: string;
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<{ txId?: string; status: 'SIMULATED' | 'PENDING' | 'COMPLETED' }>;
};

/**
 * 生产一个 USDT 客户端。
 * 现在默认返回“模拟实现”，即使没有任何环境变量也能工作，便于在 Vercel 上先跑通。
 * 以后你要接真网关（Coinremitter 等），把这里切换到真实实现即可。
 */
export function getUSDTClient(): USDTClient {
  // 将来可按需切换：
  // const useSim = process.env.USE_SIMULATION === 'true' || !process.env.USDT_API_KEY;
  // if (!useSim) return createRealClient({ apiKey: process.env.USDT_API_KEY!, baseURL: process.env.USDT_API_BASE! });

  return simClient;
}

// ------- 模拟实现（可部署可运行） -------

const simBalances = new Map<string, number>(); // userId -> balance (number)

const simClient: USDTClient = {
  async getOrCreateWallet(userId) {
    // 用 userId 生成一个稳定的“假地址”，仅用于前端展示
    const suffix = userId.slice(0, 6).padEnd(6, 'x');
    return { depositAddress: `T-SIM-${suffix}-DEPOSIT` };
  },

  async getBalance(userId) {
    const n = simBalances.get(userId) ?? 0;
    // 保留两位小数字符串
    return { balance: n.toFixed(2) };
  },

  async send({ userId, toAddress, amount }) {
    // 仅演示：把用户余额减掉发送金额（若余额不足记为 0），并返回一个模拟 txId
    const amt = Math.max(0, Number(amount) || 0);
    const current = simBalances.get(userId) ?? 0;
    const next = Math.max(0, current - amt);
    simBalances.set(userId, next);

    const txId = `sim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    // 真实网关时在这里调用 provider API，并把返回的 txId/status 写进 DB
    return { txId, status: 'SIMULATED' };
  },
};
