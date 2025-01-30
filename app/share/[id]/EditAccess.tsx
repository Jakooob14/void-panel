'use client';

import { setPublic, setViewers } from '@/app/actions/file';
import { AnchorButton, OutlineButton } from '@/app/components/Buttons';
import { useToast } from '@/app/components/ToastController';
import { useModal } from '@/app/components/ModalController';
import { FormEvent, useState } from 'react';
import { CheckboxInput, Input } from '@/app/components/Form';
import { FaTrashAlt } from 'react-icons/fa';

interface EditAccessProps {
  id: string;
  isPublicDefault: boolean;
  viewersDefault: string[];
}

export default function EditAccess({ id, isPublicDefault, viewersDefault }: EditAccessProps) {
  const { showModal, closeModal } = useModal();

  return (
    <div>
      <OutlineButton onClick={async () => showModal(false, <AccessModal id={id} onClose={closeModal} isPublicDefault={isPublicDefault} viewersDefault={viewersDefault} />, 'Úprava přístupu')}>
        Upravit přístup
      </OutlineButton>
    </div>
  );
}

interface AccessModalProps extends EditAccessProps {
  onClose: () => void;
}

function AccessModal({ id, isPublicDefault, viewersDefault }: AccessModalProps) {
  const showToast = useToast();
  const [isPublic, setIsPublic] = useState(isPublicDefault);
  const [localViewers, setLocalViewers] = useState<string[]>(viewersDefault);

  const handleSave = async () => {
    if (isPublicDefault !== isPublic) {
      const publicResult = await setPublic(id, isPublic);
      if (publicResult === true) {
        showToast('Úspěšně změněna věřejnost.');
        return;
      }
      showToast(publicResult as string);
      return;
    }

    const result = await setViewers(id, localViewers);

    if (result === true) {
      showToast('Úspěšně uloženo.');
      return;
    }

    showToast(result as string);
  };

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const viewerToAdd = (form.elements.namedItem('viewer') as HTMLInputElement).value;

    setLocalViewers([...localViewers, viewerToAdd]);
  };

  const handleDelete = (e: React.MouseEvent<HTMLSpanElement>) => {
    const viewerToDelete = e.currentTarget.parentElement?.getAttribute('data-viewer');

    if (viewerToDelete) {
      setLocalViewers(localViewers.filter((viewer) => viewer !== viewerToDelete));
    }
  };

  return (
    <div>
      <div className={'flex justify-between mt-2 gap-4'}>
        <span>Veřejné</span>
        <CheckboxInput checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
      </div>
      <form className={'flex flex-col gap-4 my-4'} onSubmit={handleAdd}>
        <Input disabled={isPublic} name={'viewer'} />
        <Input
          className={'bg-transparent !text-white border-aero-500 border-2 transition-all enabled:hover:!text-black enabled:hover:bg-aero-600 enabled:hover:border-aero-600 enabled:cursor-pointer'}
          type={'submit'}
          value={'Přidat'}
          disabled={isPublic}
        />
      </form>
      <ul className={'mt-2 mb-4'}>
        {localViewers.map((item, index) => (
          <li className={'flex justify-between'} key={index} data-viewer={item}>
            {item}
            <span className={'transition-colors hover:text-red-500 cursor-pointer'} onClick={handleDelete}>
              <FaTrashAlt />
            </span>
          </li>
        ))}
      </ul>
      <AnchorButton onClick={handleSave}>Uložit</AnchorButton>
    </div>
  );
}
