import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { env } from '@/config/env';

export interface AuthUser {
  id: string;
  email: string;
}

export function extractUserFromToken(request: NextRequest): AuthUser {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const payload = verify(token, env.JWT_SECRET) as any;
    return {
      id: payload.id,
      email: payload.email,
    };
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}