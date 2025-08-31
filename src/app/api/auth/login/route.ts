export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env'; // 确保有 JWT_SECRET

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
    if (!user) {
      return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const ok = await compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    // 生成 JWT（你也可以加 exp）
    const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET);

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } }, { status: 200 });

    // ✅ 关键：写 HttpOnly Cookie，作用域根路径
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: true,          // Vercel 上是 https
      sameSite: 'lax',
      path: '/',             // 覆盖全站
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });

    return res;
  } catch (e: any) {
    console.error('LOGIN_ERROR', e?.message || e);
    return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
  }
}
