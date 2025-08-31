import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';
import { issueCardSchema } from '@/lib/validation';
import { getGiftbitClient } from '@/providers/giftbit';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);
    const body = await request.json();
    const { amount } = issueCardSchema.parse(body);

    const giftbitClient = getGiftbitClient();

    // Issue card via provider
    const card = await giftbitClient.issueCard({
      userId: user.id,
      amount,
    });

    // Store card info in database
    const dbCard = await db.card.create({
      data: {
        userId: user.id,
        providerType: 'giftbit',
        providerId: card.id,
        last4: card.last4,
        expiry: card.expiry,
        balance: card.balance,
        status: card.status,
      },
    });

    return NextResponse.json({
      cardId: dbCard.id,
      providerId: card.id,
      last4: card.last4,
      expiry: card.expiry,
      balance: card.balance,
      status: card.status,
    });
  } catch (error) {
    console.error('Card issue error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to issue card' } },
      { status: 500 }
    );
  }
}