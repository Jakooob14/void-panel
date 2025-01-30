'use client';

import { ReactNode } from 'react';
import { useModal } from '@/app/components/ModalController';
import { AnchorButton } from '@/app/components/Buttons';
import { useRouter } from 'next/navigation';
import { deleteFile } from '@/app/actions/file';

interface DeleteProps {
  children?: ReactNode;
  className?: string;
  onDelete?: () => void;
  id: string;
}

export default function DeleteButton({ children, id, onDelete, className }: DeleteProps) {
  const router = useRouter();
  const { showModal, closeModal } = useModal();
  if (!id) return null;

  // const handleDelete = () => {
  //   fetch('/api/share', {
  //     method: 'DELETE',
  //     body: JSON.stringify({
  //       id: id,
  //     }),
  //   }).then((res) => {
  //     if (onDelete) onDelete();
  //     router.push('/share');
  //   });
  // };

  return (
    <button
      className={className}
      onClick={() =>
        showModal(
          false,
          'Opravdu si přejete smazat tento soubor?',
          'Opravdu?',
          <AnchorButton onClick={() => deleteFile(id)}>Vymáznout</AnchorButton>,
          undefined,
          <button className={'px-4 w-full h-full'}>Zrušit</button>
        )
      }
    >
      {children}
    </button>
  );
}
