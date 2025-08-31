// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';
import { getETHBalance, getXRPBalance } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);

    const account = await db.account.findUnique({
      where: { userId: user.id },
    });

    if (!account || !account.ethAddress || !account.xrpAddress) {
      return NextResponse.json(
        { error: { code: 'WALLET_NOT_INITIALIZED', message: 'Wallet not initialized' } },
        { status: 400 }
      );
    }

    // Fetch balances from blockchain
    const [ethBalance, xrpBalance] = await Promise.all([
      getETHBalance(account.ethAddress),
      getXRPBalance(account.xrpAddress),
    ]);

    return NextResponse.json({
      eth: ethBalance,
      xrp: xrpBalance,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch balances' } },
      { status: 500 }
    );
  }
}
