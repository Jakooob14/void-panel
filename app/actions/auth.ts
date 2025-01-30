'use server';

import { cookies } from 'next/headers';
import { createSession, destroyAllUserSessions, destroySession, getCurrentUserId } from '@/app/actions/session';
import { redirect } from 'next/navigation';
import prisma from '@/app/utilities/prisma';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createOrUpdateRate } from '@/app/actions/rate';
import checkPasswordIntegrity from '@/app/utilities/checkPasswordIntegrity';

export async function confirmCurrentUserPassword(password: string) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const record = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  return await bcrypt.compare(password, record.password);
}

export async function signup(username: string, email: string, password: string, passwordAgain: string) {
  const rate = await createOrUpdateRate();
  if (rate > 5) return 'Zpomal trochu!';

  if (!username) return 'Chybí uživatelské jméno!';
  if (!email) return 'Chybí e-mail!';
  if (!password) return 'Chybí heslo!';
  if (password !== passwordAgain) return 'Hesla se neshodují';

  if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    return 'Neplatný formát e-mailu';
  }

  const passwordIntegrity = checkPasswordIntegrity(password);
  if (passwordIntegrity.length > 0) {
    return passwordIntegrity;
  }

  try {
    const whitelistEmail = await prisma.userWhitelist.findUnique({
      where: {
        email,
      },
    });

    if (!whitelistEmail) return 'Nemáte povolení k registraci';

    const hashedPassword = await bcrypt.hash(password, 10);
    const record = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const sessionId = await createSession(record.id);
    const refreshId = await createSession(record.id, 'refresh', 2592000);

    const cks = await cookies();
    cks.set('accessToken', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 1800,
    });
    cks.set('refreshToken', refreshId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 2592000,
    });
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002' && err.meta && err.meta.target) {
        if (!(err.meta.target instanceof Array)) return 'Chyba serveru';
        if (err.meta.target.includes('username')) {
          return 'Uživatelské jméno již existuje!';
        } else if (err.meta.target.includes('email')) {
          return 'E-Mail již existuje!';
        }
      }
    }

    console.error(err.stack);
    return 'Chyba serveru';
  }

  redirect('/share');
}

export async function login(username: string, password: string) {
  const rate = await createOrUpdateRate();
  if (rate > 10) return 'Zpomal trochu!';

  if (!username) return 'Chybí uživatelské jméno nebo email!';
  if (!password) return 'Chybí heslo!';

  try {
    const record = await prisma.user.findFirstOrThrow({
      where: {
        OR: [{ username: username }, { email: username }],
      },
    });

    const isCorrect = await bcrypt.compare(password, record.password);

    if (isCorrect) {
      const sessionId = await createSession(record.id);
      const refreshId = await createSession(record.id, 'refresh', 2592000);

      const cks = await cookies();

      cks.set('accessToken', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 1800,
      });

      cks.set('refreshToken', refreshId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 2592000,
      });
    } else {
      return 'Nesprávné přihlašovací údaje!';
    }
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return 'Nesprávné přihlašovací údaje!';
    }

    console.error(err.stack);
    return 'Chyba serveru';
  }

  redirect('/share');
}

export async function logout() {
  await destroySession();
}

export async function changePassword(oldPassword: string, newPassword: string, newPasswordAgain: string) {
  const passwordIntegrity = checkPasswordIntegrity(newPassword);
  if (passwordIntegrity.length > 0) {
    return passwordIntegrity;
  }

  if (newPassword !== newPasswordAgain) return 'Hesla se neshodují';

  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const isPasswordCorrect = await confirmCurrentUserPassword(oldPassword);
    if (!isPasswordCorrect) return 'Nesprávné heslo!';

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    await destroyAllUserSessions();

    return true;
  } catch (err: any) {
    console.error(err.stack);
    return 'Chyba serveru';
  }
}

export async function changeProfileDetails(confirmPassword: string, username?: string, email?: string) {
  const rate = await createOrUpdateRate();
  if (rate > 10) return 'Zpomal trochu!';

  const userId = await getCurrentUserId();
  if (!userId) return false;

  if (email && !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    return 'Neplatný formát e-mailu';
  }

  try {
    const isPasswordCorrect = await confirmCurrentUserPassword(confirmPassword);
    if (!isPasswordCorrect) return 'Nesprávné heslo!';

    const record = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        email,
      },
    });
  } catch (err: any) {
    console.error(err.stack);
    return 'Chyba serveru';
  }

  return true;
}
