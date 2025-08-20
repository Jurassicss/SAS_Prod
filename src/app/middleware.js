// middleware.js
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// список защищённых маршрутов
const protectedRoutes = ['/protect', '/protect/view', '/protect/editor', '/protect/state'];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Проверяем, нужно ли защищать этот путь
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    if (!isProtected) return NextResponse.next();

    // Получаем пользователя из cookie (или заголовков, если localStorage недоступен)
    const userCookie = request.cookies.get('auth_user')?.value;
    if (!userCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); // чтобы вернуться потом
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie));

      if (!user || !user.username) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
}


export const config = {
    matcher: ['/protect/:path*'], // защищаем всё в /protect/*
};