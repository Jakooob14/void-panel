'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Heading1 } from '@/app/components/Headings';
import { AnchorButton } from '@/app/components/Buttons';
import { DeleteButton, DownloadButton } from '@/app/page';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FileProps {
  id: string;
}

export default function FileClient({ id }: FileProps) {
  const router = useRouter();

  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/share?id=${id}&minimal=true`).then((res) => {
      setFile(res.data);
    });
  }, []);

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
          <Image src={`/api/share?id=${id}`} alt={file.name} width={10} height={10} className={'w-[80%] max-w-[1000px]'} />
        </div>
      )}
    </main>
  );
}
