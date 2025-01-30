'use client';

import { Key } from 'react';
import Link from 'next/link';
import { FaDownload } from 'react-icons/fa6';
import { FaFile, FaLink, FaTrashAlt } from 'react-icons/fa';
import Image from 'next/image';
import { AnchorButton } from '@/app/components/Buttons';
import AddFile from '@/app/share/add/AddFile';
import { useModal } from '@/app/components/ModalController';
// import { useSession } from '@/app/context/SessionContext';
import useSWR from 'swr';
import DeleteButton from '@/app/share/DeleteButton';
import DownloadButton from '@/app/share/DownloadButton';

export default function Home() {
  const files = useSWR('/api/share');

  // const session = useSession();
  // console.log(session);

  const { showModal, closeModal } = useModal();

  const updateFiles = () => {
    files.mutate();
  };

  return (
    <main className={'mt-6'}>
      <ul className={'flex flex-wrap gap-4'}>
        {!files.isLoading ? (
          files.data && files.data.length !== 0 ? (
            files.data.files.map((file: { fileName: string; fileId: string }, index: Key | null | undefined) => (
              <li className={'w-[320px] h-[275px] bg-alt-gray-100 flex flex-col justify-between p-4 gap-4'} key={index}>
                <span className={'overflow-hidden whitespace-nowrap text-ellipsis w-full min-h-6'} title={file.fileName}>
                  {file.fileName}
                </span>
                <div className={'text-[70px] w-full overflow-hidden flex justify-center'}>
                  {file.fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                    <Image className={'w-full h-full object-cover'} quality={50} width={200} height={200} src={`/api/share?id=${file.fileId}`} alt={file.fileName} />
                  ) : (
                    <FaFile className={'w-min'} />
                  )}
                </div>
                <div className={'flex justify-end gap-2'}>
                  <DeleteButton className={'text-xl transition-colors hover:text-red-500'} id={file.fileId} onDelete={updateFiles}>
                    <FaTrashAlt />
                  </DeleteButton>
                  <Link className={'text-white text-xl'} href={`/share/${file.fileId}`}>
                    <FaLink />
                  </Link>
                  <DownloadButton url={`/api/share?id=${file.fileId}`} name={file.fileName}>
                    <FaDownload className={'text-xl'} />
                  </DownloadButton>
                  {/** TODO: Expiring in */}
                </div>
              </li>
            ))
          ) : (
            <span>zadne soubory LLLLLLLLLLLLLL</span>
          )
        ) : (
          <span>Načítání...</span>
        )}
      </ul>
      <AnchorButton
        className={'fixed bottom-0 right-0 font-heading text-4xl rounded-full font-bold !p-0 m-6 w-12 h-12 grid place-items-center'}
        onClick={() =>
          showModal(
            false,
            <AddFile
              onUpload={() => {
                updateFiles();
                closeModal();
              }}
            />
          )
        }
      >
        +
      </AnchorButton>
    </main>
  );
}
