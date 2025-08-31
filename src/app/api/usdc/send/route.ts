// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';
import { sendUSDCSchema } from '@/lib/validation';
import { getCircleClient } from '@/providers/circle';
import { env } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const body = await request.json();
    const { toAddress, amount, label } = sendUSDCSchema.parse(body);

    const circleClient = getCircleClient();
    const walletId = `sim-wallet-${user.id}`;
    
    // Create transfer
    const transfer = await circleClient.createTransfer({
      walletId,
      toAddress,
      amount,
      idempotencyKey: `usdc-${user.id}-${Date.now()}`,
    });

    // Record transfer in database
    const dbTransfer = await db.transfer.create({
      data: {
        userId: user.id,
        asset: 'USDC',
        chain: 'ethereum',
        toAddress,
        amount,
        txHash: transfer.transactionHash,
        status: env.USE_SIMULATION ? 'SIMULATED' : transfer.status.toUpperCase(),
        label,
      },
    });

    return NextResponse.json({
      transferId: transfer.id,
      dbTransferId: dbTransfer.id,
      status: dbTransfer.status,
      txHash: transfer.transactionHash,
      amount,
      toAddress,
    });
  } catch (error) {
    console.error('USDC send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to send USDC' } },
      { status: 500 }
    );
  }
}
