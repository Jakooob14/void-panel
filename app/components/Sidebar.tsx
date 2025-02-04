'use server';

import SidebarClient from '@/app/components/SidebarClient';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import crypto from 'crypto';

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

  const avatarUrl = `https://gravatar.com/avatar/${crypto.hash('sha256', user ? user.email.trim().toLowerCase() : 'too-bad')}?s=48&d=identicon`;

  return <SidebarClient user={user ? { username: user?.username || '', email: user?.email || '', avatar: avatarUrl } : null} />;
}
