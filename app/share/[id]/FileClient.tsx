'use client';

import { Heading1 } from '@/app/components/Headings';
import { AnchorButton } from '@/app/components/Buttons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DownloadButton from '@/app/share/DownloadButton';
import DeleteButton from '@/app/share/DeleteButton';

interface FileProps {
  id: string;
  file: { name: string };
}

export default function FileClient({ id, file }: FileProps) {
  const router = useRouter();

  return (
    <main className={'container p-4 mx-auto'}>
      {file && (
        <div>
          <Heading1 className={'!text-6xl overflow-hidden whitespace-nowrap text-ellipsis w-full'} title={file.name}>
            {file.name}
          </Heading1>
          <div className={'my-8 flex gap-4'}>
            <DownloadButton url={`/api/share?id=${id}`} name={file.name}>
              <AnchorButton>Stáhnout</AnchorButton>
            </DownloadButton>
            <DeleteButton className={'cursor-pointer'} id={id} onDelete={() => router.push('/')}>
              Vymáznout
            </DeleteButton>
          </div>
          <Image src={`/api/share?id=${id}`} alt={file.name} width={1000} height={1000} className={'w-[80%] max-w-[1000px]'} />
        </div>
      )}
    </main>
  );
}
