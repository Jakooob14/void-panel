'use server';

import SidebarClient from '@/app/components/SidebarClient';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import { getGravatar } from '@/app/utilities/avatar';
import { getAvatar } from '@/app/actions/user';

export default async function Sidebar() {
  const userId = await getCurrentUserId();

  const user = await prisma.user.findUnique({
    where: {
      id: userId ? userId : '',
    },
    select: {
      username: true,
      email: true,
    },
  });

  const avatarUrl = getGravatar(user?.email || 'too-bad');

  return <SidebarClient user={user ? { username: user?.username || '', email: user?.email || '', avatar: (await getAvatar()) || avatarUrl } : null} />;
}
