'use client'

import {Input} from "@/app/components/Form";
import {FormEventHandler, useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {Heading1} from "@/app/components/Headings";

export default function Login() {
    const router = useRouter();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEventHandler<HTMLFormElement>) => {
        e.preventDefault();

        const usernameEmail = e.target.usernameEmail.value;
        const password = e.target.password.value;

        if (!usernameEmail) {
            setErrorMessage('Chybí uživatelské jméno nebo e-mail!');
            return;
        }

        if (!password) {
            setErrorMessage('Chybí heslo!');
            return;
        }

        await axios.post('/api/auth/user/login', {
            username: usernameEmail,
            email: usernameEmail,
            password: password
        })
            .then((res) => {
                setErrorMessage(null);
                router.push('/');
            })
            .catch((err) => {
            if (err.status === 401) {
                setErrorMessage('Nesprávné přihlašovací údaje');
                return;
            }
            console.error(err.stack);
        });
    }

    return (
        <main className={'flex justify-center items-center h-screen'}>
            <div className={'flex flex-col justify-center items-center gap-8'}>
                <Heading1>Přihlášení</Heading1>
                <form className={'flex flex-col w-[300px] gap-4'} onSubmit={handleSubmit}>
                    <Input className={'w-full'} name="usernameEmail" placeholder="Uživatelské jméno / E-Mail" />
                    <Input className={'w-full'} name="password" type="password" placeholder="Heslo" />
                    {/* TODO: Captcha */}
                    {errorMessage && <span className={'text-sm text-red-500 -mb-2.5'}>{errorMessage}</span>}
                    <Input className={'w-full'} type="submit" value="Login" />
                </form>
            </div>
        </main>
    )
}