import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utilities/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import bcrypt from 'bcrypt';
import { createSession } from '@/app/actions/session';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username && !email) return NextResponse.json({ message: 'Missing username or email' }, { status: 400 });
    if (!password) return NextResponse.json({ message: 'Missing password' }, { status: 400 });

    const record = await prisma.user.findFirstOrThrow({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    const res = await bcrypt.compare(password, record.password);

    if (res) {
      const sessionId = await createSession(record.id);
      const refreshId = await createSession(record.id, 'refresh', 2592000);

      const headers = new Headers();

      const response = NextResponse.json(
        {
          message: 'Authentication successful',
          userId: record.id,
        },
        {
          headers,
        }
      );

      response.cookies.set('accessToken', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 1800,
      });

      response.cookies.set('refreshToken', refreshId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 2592000,
      });

      return response;
    } else {
      return NextResponse.json({ message: 'Authentication unsuccessful' }, { status: 401 });
    }
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
