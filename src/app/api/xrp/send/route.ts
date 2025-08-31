// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';
import { sendXRPSchema } from '@/lib/validation';
import { decryptWalletKeys, sendXRP } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const body = await request.json();
    const { toAddress, amountXrp, label } = sendXRPSchema.parse(body);

    // Get user's account
    const account = await db.account.findUnique({
      where: { userId: user.id },
    });

    if (!account || !account.encryptedData) {
      return NextResponse.json(
        { error: { code: 'WALLET_NOT_INITIALIZED', message: 'Wallet not initialized' } },
        { status: 400 }
      );
    }

    // Decrypt wallet keys
    const keys = decryptWalletKeys(account.encryptedData);

    // Send XRP transaction
    const result = await sendXRP({
      seed: keys.xrpSeed,
      toAddress,
      amount: amountXrp,
    });

    // Record transfer in database
    const dbTransfer = await db.transfer.create({
      data: {
        userId: user.id,
        asset: 'XRP',
        chain: 'ripple',
        toAddress,
        amount: amountXrp,
        txHash: result.txHash,
        status: result.status === 'tesSUCCESS' ? 'COMPLETED' : 'FAILED',
        label,
      },
    });

    return NextResponse.json({
      dbTransferId: dbTransfer.id,
      status: dbTransfer.status,
      txHash: result.txHash,
      amount: amountXrp,
      toAddress,
    });
  } catch (error) {
    console.error('XRP send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to send XRP' } },
      { status: 500 }
    );
  }
}
