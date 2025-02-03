import AddFile from '@/app/share/add/AddFile';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';
import { redirect } from 'next/navigation';

export default async function Add() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      maxFileSize: true,
    },
  });

  if (!currentUser) redirect('/login');

  return (
    <main className={'flex justify-center items-center h-screen'}>
      <AddFile maxFileSize={Number(currentUser.maxFileSize)} className={'w-full h-full justify-center'} />
    </main>
  );
}
