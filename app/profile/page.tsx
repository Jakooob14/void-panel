'use server';

import ProfileClient from '@/app/profile/Profile';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import { getGravatar } from '@/app/utilities/avatar';
import { getAvatar } from '@/app/actions/user';

export default async function Profile() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/share');

  const profile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      email: true,
    },
  });

  if (!profile) redirect('/share');

  const avatarUrl = getGravatar(profile.email || 'too-bad', 80);

  return <ProfileClient name={profile.username} email={profile.email} avatar={(await getAvatar()) || avatarUrl} />;
}
