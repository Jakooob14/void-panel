import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utilities/prisma';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {}

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username) return NextResponse.json({ message: 'Missing username' }, { status: 400 });
    if (!email) return NextResponse.json({ message: 'Missing email' }, { status: 400 });
    if (!password) return NextResponse.json({ message: 'Missing password' }, { status: 400 });

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.error(err.stack);
        return NextResponse.json({ message: 'Error hashing password' }, { status: 500 });
      }

      await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hash,
        },
      });
    });

    return NextResponse.json({ message: `Successfully created user ${username}` });
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
