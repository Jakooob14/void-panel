'use client';

import { OutlineButton } from '@/app/components/Buttons';
import AddFile from '@/app/share/add/AddFile';
import { useModal } from '@/app/components/ModalController';

interface EditFileProps {
  id: string;
  maxFileSize: number;
}

export default function EditFile({ id, maxFileSize }: EditFileProps) {
  const { showModal } = useModal();

  return <OutlineButton onClick={() => showModal(false, <AddFile editId={id} maxFileSize={maxFileSize} className={'mt-4'} />, 'Upravit soubor')}>Upravit</OutlineButton>;
}
