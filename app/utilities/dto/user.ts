import 'server-only';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import fs from 'fs/promises';

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

export async function getUserTotalFilesSize() {
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

  if (!user) return 0;

  let totalSize = 0;

  for (const file of user.files) {
    const filePath = file.path + file.id;
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      continue;
    }

    const stats = await fs.stat(file.path + file.id);
    totalSize += stats.size;
  }

  return totalSize;
}

export async function getProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      email: true,
    },
  });
}
