import { serialize } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sid';

export const setCookie = (res: NextResponse, sessionId: string) => {
  const cookie = serialize(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 3600,
    sameSite: 'strict',
  });
  res.headers.set('Set-Cookie', cookie);
};

export const getCookie = (req: NextRequest) => {
  return req.cookies.get(COOKIE_NAME);
};

export const deleteCookie = (res: NextResponse) => {
  const cookie = serialize(COOKIE_NAME, '', { maxAge: -1, path: '/' });
  res.headers.set('Set-Cookie', cookie);
};
