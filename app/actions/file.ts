'use server';

import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';

export async function deleteFile(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const record = await prisma.file.delete({
      where: {
        id,
        ownerId: userId,
      },
      select: {
        path: true,
        id: true,
      },
    });

    await fs.unlink(record.path + record.id);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return 'K tomuto obsahu nemáte oprávnění!';
    }

    console.error(err.stack);
    return 'Chyba serveru';
  }

  redirect('/share');
}

export async function setViewers(fileId: string, viewers: string[]) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // const viewers = await prisma.user.findUnique({
    //   where: {
    //     id: viewers,
    //   },
    // });
    //
    // if (!viewers) return 'Uživatel neexistuje';

    // const file = await prisma.file.findUnique({
    //   where: {
    //     id: fileId,
    //     ownerId: userId,
    //   },
    //   select: {
    //     viewers: true,
    //   },
    // });
    //
    // if (!file || file.viewers.includes(viewers)) return 'Tomuto uživateli už tento soubor byl nasdílen';

    const viewerIds: string[] = [];

    for (const viewer of viewers) {
      const viewerId = await prisma.user.findFirst({
        where: {
          OR: [
            {
              username: viewer,
            },
            {
              email: viewer,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (viewerId && viewerId.id) viewerIds.push(viewerId.id);
    }

    await prisma.file.update({
      where: {
        id: fileId,
        ownerId: userId,
      },
      data: {
        viewers: viewerIds,
      },
    });

    console.log('cool');
    return true;
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return 'K tomuto obsahu nemáte oprávnění!';
    }

    console.error(err.stack);
    return 'Chyba serveru';
  }
}

export async function setPublic(fileId: string, isPublic: boolean) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    await prisma.file.update({
      where: {
        id: fileId,
        ownerId: userId,
      },
      data: {
        public: isPublic,
      },
    });

    return true;
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return 'K tomuto obsahu nemáte oprávnění!';
    }

    console.error(err.stack);
    return 'Chyba serveru';
  }
}
