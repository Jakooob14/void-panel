'use client';

import { OutlineButton } from '@/app/components/Buttons';
import AddFile from '@/app/share/add/AddFile';
import { useModal } from '@/app/components/ModalController';

interface EditFileProps {
  id: string;
}

export default function EditFile({ id }: EditFileProps) {
  const { showModal } = useModal();

  return <OutlineButton onClick={() => showModal(false, <AddFile editId={id} />, 'asdf')}>Upravit</OutlineButton>;
}
