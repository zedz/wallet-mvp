import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { env } from '@/config/env';

// Rate limiting store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  return request.ip || 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 60;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return new NextResponse(
        JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // CORS headers
  const response = NextResponse.next();
  
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }
  
  // JWT verification for protected routes
  const protectedApiRoutes = ['/api/wallet', '/api/usdc', '/api/usdt', '/api/xrp', '/api/card', '/api/demo'];
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedApi) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      verify(token, env.JWT_SECRET);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Redirect unauthenticated users from protected pages
  const protectedPages = ['/dashboard'];
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
  
  if (isProtectedPage) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      verify(token, env.JWT_SECRET);
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};