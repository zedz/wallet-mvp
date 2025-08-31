// src/providers/usdt/index.ts

// ---- Types ----
export type USDTWallet = {
  /** 兼容 /wallets/init 路由需要的字段 */
  address: string;
  balance: string;     // 字符串格式余额，例如 "0.00"
  userId: string;
  /** 兼容旧接口/其它调用 */
  depositAddress?: string;
};

export type USDTTransferResult = {
  /** 统一转账 Id：为兼容某些路由，这里等同于 txId */
  id?: string;
  /** 提供商返回的交易 Id（模拟下就是生成的随机串） */
  txId?: string;
  /** 兼容前端/其它路由的字段名 */
  txHash?: string;
  status: 'SIMULATED' | 'PENDING' | 'COMPLETED';
};

export type USDTClient = {
  /** 旧式/部分路由：获取或创建充币地址（返回 depositAddress） */
  getOrCreateWallet: (userId: string) => Promise<{ depositAddress: string }>;
  /** 你当前 /api/usdt/wallets/init 路由使用：创建钱包（返回 address/balance/userId） */
  createWallet: (userId: string) => Promise<USDTWallet>;
  /** 查询余额（字符串，单位 USDT） */
  getBalance: (userId: string) => Promise<{ balance: string }>;
  /** 发送 USDT（标准方法） */
  send: (params: {
    userId: string;
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<USDTTransferResult>;
  /** 某些路由命名：createTransfer，当作 send 的别名 */
  createTransfer: (params: {
    userId: string;
    fromAddress?: string;
    toAddress: string;
    amount: string;
    label?: string;
    network?: string;
  }) => Promise<USDTTransferResult>;
};

// 默认返回模拟实现，便于在无密钥/沙箱下部署演示
export function getUSDTClient(): USDTClient {
  return simClient;
}

// ------- 模拟实现 -------

const simBalances = new Map<string, number>(); // userId -> balance

function buildSimAddress(userId: string) {
  const suffix = (userId || 'user').slice(0, 6).padEnd(6, 'x');
  return `T-SIM-${suffix}-ADDR`;
}

const simClient: USDTClient = {
  async getOrCreateWallet(userId) {
    const addr = buildSimAddress(userId);
    return { depositAddress: addr };
  },

  async createWallet(userId) {
    const addr = buildSimAddress(userId);
    const bal = simBalances.get(userId) ?? 0;
    return {
      address: addr,
      balance: bal.toFixed(2),
      userId,
      // depositAddress 可选，如果有其它地方需要相同地址也可同时返回：
      // depositAddress: addr,
    };
  },

  async getBalance(userId) {
    const n = simBalances.get(userId) ?? 0;
    return { balance: n.toFixed(2) };
  },

  async send({ userId, toAddress, amount }) {
    // 仅演示：扣减“本地余额”，生成模拟 txId
    const amt = Math.max(0, Number(amount) || 0);
    const current = simBalances.get(userId) ?? 0;
    const next = Math.max(0, current - amt);
    simBalances.set(userId, next);

    const txId =
      `sim_${Date.now().toString(36)}_` +
      Math.random().toString(36).slice(2, 8);

    // 同时返回 id / txId / txHash，兼容所有调用方
    return { id: txId, txId, txHash: txId, status: 'SIMULATED' };
  },

  async createTransfer(params) {
    return this.send(params);
  },
};
