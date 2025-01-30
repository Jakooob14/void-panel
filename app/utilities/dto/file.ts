import 'server-only';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';

export async function getFile(id: string) {
  const userId = await getCurrentUserId();

  return prisma.file.findUnique({
    where: {
      id,
      OR: [
        {
          ownerId: userId || undefined,
        },
        {
          viewers: {
            has: userId,
          },
        },
        {
          public: true,
        },
      ],
    },
    select: {
      name: true,
      path: true,
      public: true,
      viewers: true,
      ownerId: true,
    },
  });
}

export async function getFiles() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.file.findMany({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      path: true,
    },
  });
}

export async function getViewers(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const viewerIds = await prisma.file.findUnique({
    where: {
      id,
      OR: [
        {
          ownerId: userId || undefined,
        },
        {
          viewers: {
            has: userId,
          },
        },
        {
          public: true,
        },
      ],
    },
    select: {
      viewers: true,
    },
  });

  if (!viewerIds) return [];

  // const viewers: { username: string; email: string }[] = [];
  const viewers: string[] = [];

  for (const viewerId of viewerIds.viewers) {
    const viewer = await prisma.user.findUnique({
      where: {
        id: viewerId,
      },
      select: {
        username: true,
      },
    });

    if (!viewer) continue;
    viewers.push(viewer.username);
    // viewers.push({ username: viewer.username, email: viewer.username });
  }

  return viewers;
}
