import { NextResponse, NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/dashboard/:path*',
    // 其它需要保护的路径可加在这
  ],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // 已登录，放行
  if (token) {
    return NextResponse.next();
  }

  // 未登录，重定向到 /login，并带上回跳
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
