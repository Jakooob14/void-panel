import 'server-only';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';

export async function getCurrentUsername() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
    },
  });

  return user?.username;
}

export async function getUserFiles() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      files: true,
    },
  });

  return user?.files;
}

export async function getUserTotalFilesSize(userIdToCheck?: string | null): Promise<number | null> {
  let userId = userIdToCheck;
  if (!userId) userId = await getCurrentUserId();
  if (!userId) return null;

  const totalSize = await prisma.file.aggregate({
    where: {
      ownerId: userId,
    },
    _sum: {
      size: true,
    },
  });

  return Number(totalSize._sum.size || 0);
}
