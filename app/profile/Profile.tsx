'use client';

import { Input } from '@/app/components/Form';
import { OutlineButton } from '@/app/components/Buttons';
import { useModal } from '@/app/components/ModalController';
import { changePassword, changeProfileDetails } from '@/app/actions/auth';
import { FormEvent, useState } from 'react';
import { Heading1 } from '@/app/components/Headings';
import { useToast } from '@/app/components/ToastController';

interface ProfileProps {
  name: string;
  email: string;
}

export default function ProfileClient({ name, email }: ProfileProps) {
  const { showModal, closeModal } = useModal();
  const showToast = useToast();
  const [errorMessage, setErrorMessage] = useState(' ');

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    const result = await changeProfileDetails(password, username, email);

    setErrorMessage(typeof result === 'string' ? result : '');

    if (result === true) {
      showToast('Detaily byly úspěšně změněny.');
    }
  };

  return (
    <main className={'flex flex-col gap-8 justify-center items-center min-h-screen'}>
      <Heading1>Profil</Heading1>
      <form className={'flex flex-col w-[320px] gap-3'} onSubmit={handleSave}>
        <Input label={'Uživatelské jméno'} defaultValue={name} placeholder={name} name={'username'} autoComplete={'username'} />
        <Input label={'E-Mail'} defaultValue={email} placeholder={email} name={'email'} autoComplete={'email'} />
        <OutlineButton
          className={'mt-2'}
          onClick={() => {
            showModal(false, <PasswordChangeForm onClose={closeModal} />, 'Změna hesla');
          }}
        >
          Změnit heslo
        </OutlineButton>
        <span className={'mt-2'}>
          <Input label={'Ověření hesla'} type={'password'} name={'password'} autoComplete={'current-password'} />
        </span>
        <Input type={'submit'} value={'Uložit'} />
        <span className={'text-sm text-red-500'}>{errorMessage}</span>
      </form>
    </main>
  );
}

interface PasswordChangeFormProps {
  onClose: () => void;
}

function PasswordChangeForm({ onClose }: PasswordChangeFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | string[]>(' ');

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    const newPasswordAgain = (form.elements.namedItem('newPasswordAgain') as HTMLInputElement).value;

    const result = await changePassword(currentPassword, newPassword, newPasswordAgain);

    setErrorMessage(typeof result === 'string' || typeof result === 'object' ? result : '');

    if (result === true) {
      onClose();
    }
  };

  return (
    <form className={'mb-6 flex flex-col gap-3'} onSubmit={handlePasswordChange}>
      <Input type={'password'} label={'Aktuální heslo'} name={'currentPassword'} autoComplete={'current-password'} />
      <Input type={'password'} label={'Nové heslo'} name={'newPassword'} autoComplete={'new-password'} />
      <Input type={'password'} label={'Nové heslo znovu'} name={'newPasswordAgain'} autoComplete={'new-password'} />
      <div className={'flex gap-3 items-center'}>
        <Input type={'submit'} value={'Potvrdit'} className={'!w-min !border-0 !px-4 !py-1 !bg-aero-500 !text-black transition-[background] hover:!bg-aero-600 cursor-pointer'} />
        <span className={'cursor-pointer'} onClick={onClose}>
          Zrušit
        </span>
      </div>
      {typeof errorMessage === 'object' && errorMessage.length > 0 ? (
        <ul className={'text-sm text-red-500'}>
          {errorMessage.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <span className={'text-sm text-red-500'}>{errorMessage}</span>
      )}
      <span className={'text-sm text-alt-gray-700'}>Tato akce tě odhlásí ze všech zařízení včetně tohoto</span>
    </form>
  );
}
