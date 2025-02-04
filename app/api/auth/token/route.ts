import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSession } from '@/app/actions/session';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cks = await cookies();
  const accessToken = cks.get('accessToken')?.value;
  const refreshToken = cks.get('refreshToken')?.value;
  const doRefresh = req.nextUrl.searchParams.get('refresh') !== 'false';

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    if (!accessToken) {
      if (!doRefresh) return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
      if (!refreshToken) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
      }
      return await refresh(refreshToken);
    }

    if (!accessToken) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const session = await getSession(accessToken);

    if (!session) {
      if (refreshToken && doRefresh) {
        return await refresh(refreshToken);
      } else return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Authentication successful', session });
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function refresh(refreshToken: string) {
  // Refresh the accessToken
  try {
    const refresh = await getSession(refreshToken, 'refresh');
    if (!refresh) return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });

    const sessionId = await createSession(refresh.userId);
    const res = NextResponse.json({ message: 'Authentication successful', session: refresh });
    res.headers.append('Set-Cookie', `accessToken=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800`);
    return res;
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
