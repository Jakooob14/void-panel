'use server';

import File from '@/app/share/File';
import AddFileButton from '@/app/share/AddFileButton';
import { getUserFiles, getUserTotalFilesSize } from '@/app/utilities/dto/user';
import fs from 'fs/promises';
import { getMimeType } from '@/app/utilities/mimeType';
import { getCurrentUserId } from '@/app/actions/session';
import { redirect } from 'next/navigation';
import formatBytes from '@/app/utilities/formatBytes';

export default async function Share() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/share');

  const files = await getUserFiles();

  const totalSize = (await getUserTotalFilesSize()) || 0;

  const totalSizePercentage = (totalSize / Number(process.env.NEXT_PUBLIC_MAX_TOTAL_FILES_SIZE)) * 100;

  return (
    <main className={'mt-6 flex flex-col gap-2'}>
      <div className={'flex'}>
        <div className={'w-40'}>
          <div className={`bg-alt-gray-100 py-3 px-4 font-semibold w-full text-center ${totalSizePercentage > 95 ? 'text-red-500' : totalSizePercentage > 90 && 'text-yellow-500'}`}>
            {formatBytes(totalSize, 2)} / {formatBytes(Number(process.env.NEXT_PUBLIC_MAX_TOTAL_FILES_SIZE))}
          </div>
          <div className={'w-full h-1 bg-alt-gray-300'}>
            <div
              className={`bg-aero-500 transition-all h-full ${totalSizePercentage > 95 ? 'bg-red-500' : totalSizePercentage > 90 && 'bg-yellow-500'}`}
              style={{ width: totalSizePercentage + '%' }}
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

              const fileBuffer = await fs.readFile(filePath);
              const mimeType = getMimeType(fileBuffer);
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
      <AddFileButton />
    </main>
  );
}
