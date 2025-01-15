'use client'

import {Input} from "@/app/components/Form";
import {FormEventHandler, useState} from "react";
import axios from "axios";

export default function Login() {
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

        const result = await axios.post('/api/user/login', {
            username: usernameEmail,
            email: usernameEmail,
            password: password
        });

        setErrorMessage(null);

        console.log()
    }

    return (
        <main className={'flex justify-center items-center h-screen'}>
            <form className={'flex flex-col w-[300px] gap-4'} onSubmit={handleSubmit}>
                <Input className={'w-full'} name="usernameEmail" placeholder="Uživatelské jméno / E-Mail" />
                <Input className={'w-full'} name="password" type="password" placeholder="Heslo" />
                {/* TODO: Captcha */}
                {errorMessage && <span className={'text-sm text-red-500 -mb-2.5'}>{errorMessage}</span>}
                <Input className={'w-full'} type="submit" value="Login" />
            </form>
        </main>
    )
}