'use client';

import { Input } from '@/app/components/Form';
import { FormEvent, useState } from 'react';
import { Heading1 } from '@/app/components/Headings';

import { login } from '@/app/actions/user';

export default function Login() {
  const [errorMessage, setErrorMessage] = useState<string>(' ');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const usernameEmail = (form.elements.namedItem('usernameEmail') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (!usernameEmail) {
      setErrorMessage('Chybí uživatelské jméno nebo email!');
      return;
    }

    if (!password) {
      setErrorMessage('Chybí heslo!');
      return;
    }

    setErrorMessage(await login(usernameEmail, password));
  };

  return (
    <main className={'flex justify-center items-center h-screen'}>
      <div className={'flex flex-col justify-center items-center gap-8'}>
        <Heading1>Přihlášení</Heading1>
        <form className={'flex flex-col w-[350px] gap-4'} onSubmit={handleSubmit}>
          <Input className={'w-full'} name='usernameEmail' placeholder='Uživatelské jméno / E-Mail' autoComplete={'username'} />
          <Input className={'w-full'} name='password' type='password' placeholder='Heslo' autoComplete={'current-password'} />
          {/* TODO: Captcha */}
          <Input className={'w-full'} type='submit' value='Přihlásit' />
          <span className={'text-sm text-red-500'}>{errorMessage}</span>
        </form>
      </div>
    </main>
  );
}
