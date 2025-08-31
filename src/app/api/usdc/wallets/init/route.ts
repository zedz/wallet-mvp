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