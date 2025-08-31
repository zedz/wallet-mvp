export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    // 直接调用 prisma migrate deploy
    const { stdout } = await execAsync('npx prisma migrate deploy');
    return NextResponse.json({ ok: true, output: stdout });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
