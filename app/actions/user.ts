'use server';

import { createOrUpdateRate } from '@/app/actions/rate';
import { createSession, destroyAllUserSessions, destroySession, getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import sharp from 'sharp';
import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import checkPasswordIntegrity from '@/app/utilities/checkPasswordIntegrity';
import { cookies } from 'next/headers';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { redirect } from 'next/navigation';

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
  if (!/^[a-zA-Z0-9]+$/.test(username)) return 'Uživatelské jméno může obsahovat jen písmena a čísla!';
  if (!email) return 'Chybí e-mail!';
  if (!password) return 'Chybí heslo!';
  if (!passwordAgain) return 'Chybí potvrzení hesla!';
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
    if (err instanceof PrismaClientKnownRequestError) {
      return 'Nesprávné přihlašovací údaje!';
    }

    console.error(err.stack);
    return 'Chyba serveru';
  }
}

export async function deleteAccount(username: string, password: string) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const record = await prisma.user.findUnique({
      where: {
        id: userId,
        username: username,
      },
    });

    if (!record) return 'Nesprávné údaje!';

    const isCorrect = await bcrypt.compare(password, record.password);

    if (isCorrect) {
      await destroySession();

      await prisma.file.deleteMany({
        where: {
          ownerId: userId,
        },
      });

      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return true;
    } else {
      return 'Nesprávné údaje!';
    }
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

export async function changeAvatar(base64Image: string | null) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    if (!base64Image) {
      await fs.unlink(`avatars/${userId}`);
      return true;
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    if (imageBuffer.length > 2 * 1024 * 1024) return 'Soubor je větší než 2 MB!';

    const optimizedImage = await sharp(imageBuffer).resize(128).jpeg({ quality: 80 }).toBuffer();

    await fs.writeFile(`avatars/${userId}`, optimizedImage);

    return true;
  } catch (err: any) {
    if (err.message.includes('Input buffer contains unsupported image format')) {
      return 'Neplatný formát avataru.';
    }
    console.error(err);
    return null;
  }
}

export async function getAvatar() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const file = await fs.readFile(`avatars/${userId}`);
    return `data:image/jpeg;base64,${file.toString('base64')}`;
  } catch (err: any) {
    if (err.errno == -4058) return null;
    console.error(err);
    return null;
  }
}
