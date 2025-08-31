// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行
import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth';
import { getUSDTClient } from '@/providers/usdt';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const usdtClient = getUSDTClient();

    const wallet = await usdtClient.createWallet(user.id);

    return NextResponse.json({
      address: wallet.address,
      balance: wallet.balance,
      userId: wallet.userId,
    });
  } catch (error) {
    console.error('USDT wallet initialization error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to initialize USDT wallet' } },
      { status: 500 }
    );
  }
}
