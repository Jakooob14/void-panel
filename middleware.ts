import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const allowedRoutes = [/^\/$/, /^\/login$/, /^\/signup$/, /^\/share\/[^/]+$/];
// const protectedRoutes = [/^\/share(\/.*)?$/];
const loginRoutes = ['/login', '/signup'];

export default async function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' && (!req.headers.get('cf-connecting-ip') || req.headers.get('host') !== 'void.jakooob.dev')) {
    return NextResponse.json('Na stránku je možné vstoupit jen přes void.jakooob.dev. Pokud tak je, tak mě kontaktujte na sokoljakub14@gmail.com.');
  }

  const res = NextResponse.next();
  res.headers.set('X-Pathname', req.nextUrl.pathname);

  // TODO: CHANGE!!!
  res.headers.set('cf-connecting-ip', '2a02:8309:4286:3000:1047:63cf:6d95:c1fd');

  const cks = await cookies();
  const accessToken = cks.get('accessToken')?.value || cks.get('refreshToken')?.value;

  let session = null;
  let cookie = null;

  // Verify that accessToken cookie is valid, if not and refreshToken cookie is valid generate a new accessToken
  if (accessToken) {
    session = await fetch('https://void.jakooob.dev/api/auth/token', {
      headers: {
        Cookie: cks.toString(),
      },
    });
    cookie = session.headers.get('Set-Cookie');
    session = (await session.json()).session;
  }

  if (cookie) res.headers.append('Set-Cookie', cookie);

  const isProtectedRoute = !allowedRoutes.some((pattern) => pattern.test(req.nextUrl.pathname));
  const isLoginRoute = loginRoutes.includes(req.nextUrl.pathname);

  if (!isProtectedRoute && !isLoginRoute) return res;

  if (isProtectedRoute && !session) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.headers.set('X-Pathname', req.nextUrl.pathname);
    response.headers.set('cf-connecting-ip', '2a02:8309:4286:3000:1047:63cf:6d95:c1fd');
    return response;
  }

  if (isLoginRoute && session) {
    const nextRoute = req.nextUrl.searchParams.get('next') || '/share';
    const response = NextResponse.redirect(new URL(nextRoute, req.url));
    if (cookie) response.headers.append('Set-Cookie', cookie);
    response.headers.set('X-Pathname', req.nextUrl.pathname);
    response.headers.set('cf-connecting-ip', '2a02:8309:4286:3000:1047:63cf:6d95:c1fd');
    return response;
  }

  return res;
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*?woff|.*?ttf).*)'],
};

