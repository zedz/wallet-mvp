import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    
    const cards = await db.card.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      cards: cards.map(card => ({
        id: card.id,
        providerType: card.providerType,
        last4: card.last4,
        expiry: card.expiry,
        balance: card.balance,
        status: card.status,
        createdAt: card.createdAt,
      })),
    });
  } catch (error) {
    console.error('Cards fetch error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch cards' } },
      { status: 500 }
    );
  }
}