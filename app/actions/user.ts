'use server';

import { createOrUpdateRate } from '@/app/actions/rate';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import { confirmCurrentUserPassword } from '@/app/actions/auth';
import sharp from 'sharp';
import fs from 'fs/promises';

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
