import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';
import { sendUSDTSchema } from '@/lib/validation';
import { getUSDTClient } from '@/providers/usdt';
import { env } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const body = await request.json();
    const { toAddress, amount, label } = sendUSDTSchema.parse(body);

    const usdtClient = getUSDTClient();
    const fromAddress = `usdt-sim-${user.id}-${Date.now()}`;
    
    // Create transfer
    const transfer = await usdtClient.createTransfer({
      fromAddress,
      toAddress,
      amount,
      userId: user.id,
    });

    // Record transfer in database
    const dbTransfer = await db.transfer.create({
      data: {
        userId: user.id,
        asset: 'USDT',
        chain: 'ethereum',
        toAddress,
        amount,
        txHash: transfer.txHash,
        status: env.USE_SIMULATION ? 'SIMULATED' : transfer.status.toUpperCase(),
        label,
      },
    });

    return NextResponse.json({
      transferId: transfer.id,
      dbTransferId: dbTransfer.id,
      status: dbTransfer.status,
      txHash: transfer.txHash,
      amount,
      toAddress,
    });
  } catch (error) {
    console.error('USDT send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to send USDT' } },
      { status: 500 }
    );
  }
}