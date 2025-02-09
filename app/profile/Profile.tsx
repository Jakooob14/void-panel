'use client';

import { Input } from '@/app/components/Form';
import { OutlineButton } from '@/app/components/Buttons';
import { useModal } from '@/app/components/ModalController';
import { FormEvent, useRef, useState } from 'react';
import { Heading1 } from '@/app/components/Headings';
import { useToast } from '@/app/components/ToastController';
import { changeAvatar, changePassword, changeProfileDetails, deleteAccount } from '@/app/actions/user';
import Image from 'next/image';
import { FaPen } from 'react-icons/fa';
import formatBytes from '@/app/utilities/formatBytes';
import { useRouter } from 'next/navigation';

interface ProfileProps {
  name: string;
  email: string;
  avatar: string;
}

export default function ProfileClient({ name, email, avatar }: ProfileProps) {
  const { showModal, closeModal } = useModal();
  const [errorMessage, setErrorMessage] = useState(' ');
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const showToast = useToast();
  const avatarRef = useRef<HTMLImageElement | null>(null);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    const result = await changeProfileDetails(password, username, email);

    setErrorMessage(typeof result === 'string' ? result : '');

    if (result === true) showToast('Detaily byly úspěšně změněny.');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && avatarRef.current) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(`Soubor je větší než 2 MB! (${formatBytes(file.size)})`);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
        try {
          if (!allowedFormats.some((w) => (reader.result as string).startsWith(`data:${w}`))) {
            showToast('Neplatný formát avataru.');
            return;
          }
          setAvatarUrl(reader.result as string);

          const res = (await changeAvatar(reader.result as string)) || 'Chyba serveru';
          if (res === true) {
            window.location.reload();
            return;
          }
          showToast(res);
        } catch (err) {
          console.error('Error reading file:', err);
        }
      };
      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = async () => {
    setUploadedAvatar(null);

    const res = (await changeAvatar(null)) || 'Chyba serveru';
    if (res === true) {
      window.location.reload();
      return;
    }
    showToast(res);
  };

  return (
    <main className={'flex flex-col gap-8 justify-center items-center min-h-screen'}>
      <Heading1>Profil</Heading1>
      <form className={'flex flex-col w-[350px] gap-3'} onSubmit={handleSave}>
        <div>
          <span className={'text-alt-gray-800'}>Avatar</span>
          <div className={'flex justify-between'}>
            <div className={'w-[80%] flex flex-col justify-between'}>
              <span>Maximální velikost avataru je 2&nbsp;MB</span>
              <div className={'flex gap-3'}>
                <label className={'cursor-pointer'} htmlFor={'avatarInput'}>
                  <a>Nahrát</a>
                </label>
                <a className={'cursor-pointer'} onClick={handleResetAvatar}>
                  Reset
                </a>
              </div>
            </div>
            <div className={'w-20 h-20 relative rounded-full group'}>
              <Image
                className={'w-full h-full border-[3px] border-alt-gray-400 shadow rounded-full bg-aeroGradient object-cover'}
                unoptimized={true}
                src={avatarUrl || avatar}
                alt={'Avatar'}
                width={80}
                height={80}
                ref={avatarRef}
              />
              <input
                className={'w-full h-full text-transparent bg-transparent absolute top-0 left-0 z-10 rounded-full cursor-pointer'}
                type={'file'}
                name={'avatar'}
                id={'avatarInput'}
                accept={'image/*'}
                onChange={handleImageChange}
              />
              <div
                className={
                  'w-full h-full transition opacity-0 group-hover:opacity-100 bg-[hsla(0,0%,10%,0.7)] absolute top-0 left-0 z-10 pointer-events-none rounded-full flex justify-center items-center'
                }
              >
                <FaPen />
              </div>
            </div>
          </div>
        </div>
        <hr className={'border-alt-gray-250 border-t-2 my-1'} />
        <Input label={'Uživatelské jméno'} defaultValue={name} placeholder={name} name={'username'} autoComplete={'username'} />
        <Input label={'E-Mail'} defaultValue={email} placeholder={email} name={'email'} autoComplete={'email'} />
        <OutlineButton
          className={'mt-2 !py-2'}
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
        <hr className={'border-alt-gray-250 border-t-2 my-1'} />
        <OutlineButton
          className={'!py-2 border-red-500 hover:border-red-600 hover:bg-red-600 hover:!text-white'}
          onClick={() => showModal(false, <DeleteAccountModal onClose={closeModal} />, 'Opravdu?')}
        >
          Odstranit účet
        </OutlineButton>
        <span className={'text-sm text-red-500'}>{errorMessage}</span>
      </form>
    </main>
  );
}

interface ModalProps {
  onClose: () => void;
}

function PasswordChangeForm({ onClose }: ModalProps) {
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
    <form className={'mt-3 flex flex-col gap-3'} onSubmit={handlePasswordChange}>
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

function DeleteAccountModal({ onClose }: ModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | string[]>(' ');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await deleteAccount(username, password);

    setErrorMessage(typeof result === 'string' || typeof result === 'object' ? result : '');

    if (result === true) {
      onClose();
      router.push('/');
    }
  };

  return (
    <form className={'mt-3 flex flex-col gap-3'} onSubmit={handleSubmit}>
      <Input label={'Uživatelské jméno'} type={'username'} name={'username'} />
      <Input label={'Heslo'} type={'password'} name={'password'} autoComplete={'current-password'} />
      <div className={'flex gap-3 items-center'}>
        <Input type={'submit'} value={'Potvrdit'} className={'!w-min !border-0 !px-4 !py-1 !bg-red-500 transition-[background] !text-white hover:!bg-red-600 hover:!text-white cursor-pointer'} />
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
    </form>
  );
}
