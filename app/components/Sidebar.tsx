'use server';

import SidebarClient from '@/app/components/SidebarClient';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';

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

  return <SidebarClient user={user ? user : undefined} />;
}
