// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行
import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth';
import { getUSDTClient } from '@/providers/usdt';

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const usdtClient = getUSDTClient();

    // In a real implementation, we'd store the address in the database
    // For this MVP, we'll derive it from the user ID
    const address = `usdt-sim-${user.id}-${Date.now()}`;
    
    const balance = await usdtClient.getBalance(address);

    return NextResponse.json({
      balance,
      currency: 'USDT',
      address,
    });
  } catch (error) {
    console.error('USDT balance fetch error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch USDT balance' } },
      { status: 500 }
    );
  }
}
