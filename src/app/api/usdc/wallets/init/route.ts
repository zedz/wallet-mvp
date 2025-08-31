// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行
import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth';
import { getCircleClient } from '@/providers/circle';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const circleClient = getCircleClient();

    const wallet = await circleClient.createWallet(user.id);

    return NextResponse.json({
      walletId: wallet.walletId,
      entityId: wallet.entityId,
      type: wallet.type,
      description: wallet.description,
    });
  } catch (error) {
    console.error('USDC wallet initialization error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to initialize USDC wallet' } },
      { status: 500 }
    );
  }
}
