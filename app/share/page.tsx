'use server';

import File from '@/app/share/File';
import AddFileButton from '@/app/share/AddFileButton';
import { getUserFiles, getUserTotalFilesSize } from '@/app/utilities/dto/user';
import fs from 'fs/promises';
import { getMimeType } from '@/app/utilities/mimeType';
import { getCurrentUserId } from '@/app/actions/session';
import { redirect } from 'next/navigation';
import formatBytes from '@/app/utilities/formatBytes';
import { readFileAsPromise } from '@/app/utilities/fileHelpers';
import prisma from '@/app/utilities/prisma';

export default async function Share() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/share');

  const files = await getUserFiles();

  const totalSize = (await getUserTotalFilesSize()) || 0;

  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      maxFileSize: true,
      maxStorage: true,
    },
  });

  if (!currentUser) redirect('/share');

  const totalSizePercentage = (totalSize / Number(currentUser.maxStorage)) * 100;

  return (
    <main className={'mt-6 flex flex-col gap-2'}>
      <div className={'flex'}>
        <div>
          <div className={`bg-alt-gray-100 py-3 px-4 font-semibold w-full text-center ${totalSizePercentage > 95 ? 'text-red-500' : totalSizePercentage > 90 && 'text-yellow-500'}`}>
            {formatBytes(totalSize, 2)} / {Number(currentUser.maxStorage) === -1 ? '∞ ZB' : formatBytes(Number(currentUser.maxStorage))}
          </div>
          <div className={'w-full h-1 bg-alt-gray-300'}>
            <div
              className={`bg-aero-500 transition-all h-full ${Number(currentUser.maxStorage) === -1 ? 'rainbow-background' : totalSizePercentage > 95 ? 'bg-red-500' : totalSizePercentage > 90 && 'bg-yellow-500'}`}
              style={{ width: (Number(currentUser.maxStorage) === -1 ? 100 : totalSizePercentage) + '%' }}
            ></div>
          </div>
        </div>
      </div>
      <ul className={'flex flex-wrap gap-4'}>
        {files ? (
          files.map(async (file) => {
            try {
              const filePath = file.path + file.id;
              const exists = await fs
                .access(filePath)
                .then(() => true)
                .catch(() => false);

              if (!exists) {
                return <></>;
              }

              const startDataArray = await readFileAsPromise(file.path + file.id, { start: 16, end: 20 });
              const startData = Buffer.concat(startDataArray.map((chunk) => (typeof chunk === 'string' ? Buffer.from(chunk) : chunk)));

              const mimeType = getMimeType(startData);
              const isImage = mimeType?.startsWith('image/');

              return (
                <li key={file.id}>
                  <File fileId={file.id} fileName={file.name} expiresAt={file.expiresAt} isImage={isImage || false} />
                </li>
              );
            } catch (err) {
              console.error(`Error when processing file ${file.path + file.id}`, err);
              return <></>;
            }
          })
        ) : (
          <span>Žádné soubory</span>
        )}
      </ul>
      <AddFileButton maxFileSize={Number(currentUser.maxFileSize)} />
    </main>
  );
}
