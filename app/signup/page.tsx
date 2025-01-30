'use client';

import { Input } from '@/app/components/Form';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading1 } from '@/app/components/Headings';
import { useAuthContext } from '@/app/context/AuthContext';
import { signup } from '@/app/actions/auth';

export default function Signup() {
  const router = useRouter();
  const authContext = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | string[]>(' ');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const passwordAgain = (form.elements.namedItem('passwordAgain') as HTMLInputElement).value;

    if (!username) {
      setErrorMessage('Chybí uživatelské jméno!');
      return;
    }

    if (!email) {
      setErrorMessage('Chybí E-Mail!');
      return;
    }

    if (!password) {
      setErrorMessage('Chybí heslo!');
      return;
    }

    if (!passwordAgain) {
      setErrorMessage('Chybí potvrzení hesla!');
      return;
    }

    setErrorMessage(await signup(username, email, password, passwordAgain));
  };

  return (
    <main className={'flex justify-center items-center h-screen'}>
      <div className={'flex flex-col justify-center items-center gap-8'}>
        <Heading1>Registrace</Heading1>
        <form className={'flex flex-col w-[350px] gap-4'} onSubmit={handleSubmit}>
          <Input className={'w-full'} name={'username'} placeholder={'Uživatelské jméno'} autoComplete={'username'} />
          <Input className={'w-full'} name={'email'} placeholder={'E-Mail'} autoComplete={'email'} />
          <Input className={'w-full'} name={'password'} type={'password'} placeholder='Heslo' autoComplete={'new-password'} />
          <Input className={'w-full'} name={'passwordAgain'} type={'password'} placeholder='Heslo znovu' autoComplete={'new-password'} />
          {/* TODO: Captcha */}
          <Input className={'w-full'} type='submit' value='Registrovat' />
          <span className={'text-sm text-red-500'}>
            {typeof errorMessage === 'string' ? (
              errorMessage
            ) : (
              <ul>
                {errorMessage.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </span>
        </form>
      </div>
    </main>
  );
}
