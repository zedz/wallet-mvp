// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行
import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth';
import { getCircleClient } from '@/providers/circle';

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const circleClient = getCircleClient();

    // In a real implementation, we'd store the wallet ID in the database
    // For this MVP, we'll derive it from the user ID
    const walletId = `sim-wallet-${user.id}`;
    
    const balance = await circleClient.getBalance(walletId);

    return NextResponse.json({
      balance,
      currency: 'USD',
    });
  } catch (error) {
    console.error('USDC balance fetch error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch USDC balance' } },
      { status: 500 }
    );
  }
}
