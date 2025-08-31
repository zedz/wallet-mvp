import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractUserFromToken } from '@/lib/auth';
import { generateWalletKeys, maskAddress } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromToken(request);

    // Check if wallet already exists (idempotent)
    let account = await db.account.findUnique({
      where: { userId: user.id },
    });

    if (!account) {
      // Generate new wallet keys
      const { keys, encryptedData } = await generateWalletKeys();

      // Create account with encrypted keys
      account = await db.account.create({
        data: {
          userId: user.id,
          ethAddress: keys.ethAddress,
          xrpAddress: keys.xrpAddress,
          encryptedData,
        },
      });
    }

    return NextResponse.json({
      ethAddress: maskAddress(account.ethAddress!),
      xrpAddress: maskAddress(account.xrpAddress!),
      initialized: true,
    });
  } catch (error) {
    console.error('Wallet initialization error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to initialize wallet' } },
      { status: 500 }
    );
  }
}