import { Heading1 } from '@/app/components/Headings';
import DownloadButton from '@/app/share/DownloadButton';
import { AnchorButton } from '@/app/components/Buttons';
import DeleteButton from '@/app/share/DeleteButton';
import Image from 'next/image';
import { getFile, getViewers } from '@/app/utilities/dto/file';
import { getMimeType } from '@/app/utilities/mimeType';
import { readFileAsPromise } from '@/app/utilities/fileHelpers';
import EditAccess from '@/app/share/[id]/EditAccess';
import { getCurrentUserId } from '@/app/actions/session';
import EditFile from '@/app/share/[id]/EditFile';
import prisma from '@/app/utilities/prisma';
import type { Metadata, ResolvingMetadata } from 'next';
import { getBaseUrl } from '@/app/utilities/general';

interface FileProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FileProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = await params;

  const file = await getFile(id);
  if (!file) return {};

  const startDataArray = await readFileAsPromise(file.path + id, { start: 16, end: 20 });
  const startData = Buffer.concat(startDataArray.map((chunk) => (typeof chunk === 'string' ? Buffer.from(chunk) : chunk)));

  const mimeType = getMimeType(startData);
  const isImage = mimeType?.startsWith('image/');

  return {
    title: file.name,
    openGraph: {
      images: isImage ? [`${await getBaseUrl()}/api/share?id=${id}&w=500`] : [],
    },
  };
}

export default async function File({ params }: FileProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const file = await getFile(id);
  if (!file) return <main>K tomuto obsahu nemáte oprávnění</main>;

  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId || '',
    },
    select: {
      maxFileSize: true,
    },
  });

  const isOwner = userId === file.ownerId;

  const startDataArray = await readFileAsPromise(file.path + id, { start: 16, end: 20 });
  const startData = Buffer.concat(startDataArray.map((chunk) => (typeof chunk === 'string' ? Buffer.from(chunk) : chunk)));

  const mimeType = getMimeType(startData);
  const isImage = mimeType?.startsWith('image/');

  return (
    <main className={'container p-4 mx-auto'}>
      {file && (
        <div>
          <Heading1 className={'!text-6xl overflow-hidden whitespace-nowrap text-ellipsis w-full'} title={file.name}>
            {file.name}
          </Heading1>
          <div className={'my-8 flex items-center gap-4'}>
            <DownloadButton url={`/api/share?id=${id}`} name={file.name}>
              <AnchorButton>Stáhnout</AnchorButton>
            </DownloadButton>
            {isOwner && currentUser && (
              <>
                <EditFile maxFileSize={Number(currentUser.maxFileSize)} id={id} />
                <EditAccess id={id} isPublicDefault={file.public} viewersDefault={await getViewers(id)} />
                <DeleteButton className={'cursor-pointer'} id={id}>
                  Vymáznout
                </DeleteButton>
              </>
            )}
          </div>
          {isImage && <Image unoptimized={true} src={`/api/share?id=${id}&w=500`} alt={file.name} width={500} height={500} className={'w-[80%] max-w-[1000px]'} />}
        </div>
      )}
    </main>
  );
}
