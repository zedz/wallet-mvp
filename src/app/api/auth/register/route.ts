// ✅ 放在文件最上面
export const runtime = 'nodejs';        // 用 Node runtime，避免 Edge 限制
export const dynamic = 'force-dynamic'; // 禁止静态化，这个路由总是动态执行

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validation';
import { env } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { code: 'USER_EXISTS', message: 'User already exists' } },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
