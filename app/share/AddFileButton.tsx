'use client';

import { AnchorButton } from '@/app/components/Buttons';
import AddFile from '@/app/share/add/AddFile';
import { useModal } from '@/app/components/ModalController';
import { useRouter } from 'next/navigation';

export default function AddFileButton() {
  const { showModal, closeModal } = useModal();
  const router = useRouter();

  return (
    <AnchorButton
      className={'fixed bottom-0 right-0 font-heading text-4xl rounded-full font-bold !p-0 m-6 w-12 h-12 grid place-items-center'}
      onClick={() =>
        showModal(
          false,
          <AddFile
            onUpload={() => {
              closeModal();
              router.refresh();
            }}
          />
        )
      }
    >
      +
    </AnchorButton>
  );
}
