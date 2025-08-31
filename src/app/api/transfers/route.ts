import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    
    const transfers = await db.transfer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 transfers
    });

    return NextResponse.json({
      transfers: transfers.map(transfer => ({
        id: transfer.id,
        asset: transfer.asset,
        chain: transfer.chain,
        toAddress: transfer.toAddress,
        amount: transfer.amount,
        txHash: transfer.txHash,
        status: transfer.status,
        label: transfer.label,
        createdAt: transfer.createdAt,
      })),
    });
  } catch (error) {
    console.error('Transfers fetch error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch transfers' } },
      { status: 500 }
    );
  }
}