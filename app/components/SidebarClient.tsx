'use client';

import { AnchorButton, LinkButton } from '@/app/components/Buttons';
import { Heading1 } from '@/app/components/Headings';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  user?: {
    username: string;
    email: string;
  };
}

export default function SidebarClient({ user }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    logout().then(() => {
      router.refresh();
    });
  };

  return (
    <aside className={'w-[320px] h-screen fixed bg-alt-gray-100 shadow-lg shadow-alt-gray-100 py-4 px-6 top-0 flex flex-col justify-between'}>
      <div>
        <Heading1 className={'!text-4xl'}>Void Panel</Heading1>
        <ul className={'mt-5 flex flex-col gap-8'}>
          <li>
            <LinkButton href={'/'}>Domů</LinkButton>
          </li>
          <li>
            <LinkButton href={'/share'}>Soubory</LinkButton>
          </li>
          <li>
            <LinkButton href={'/signup'}>Registrace</LinkButton>
          </li>
          <li>
            <LinkButton href={'/login'}>Přihlášení</LinkButton>
          </li>
          {user && (
            <>
              <li>
                <AnchorButton onClick={handleLogout}>Odhlásit {user?.username}</AnchorButton>
              </li>
              <li>
                <LinkButton href={'/profile'}>Zobrazit profil</LinkButton>
              </li>
            </>
          )}
        </ul>
      </div>
      {/* TODO: Show popup for profile and logout */}
      <div className={'flex items-center'}>
        <div className={'w-[64px] h-[64px] bg-red-500 rounded-full'}></div>
        <div className={'flex flex-col ms-4'}>
          <span>{user?.username}</span>
          <span>{user?.email}</span>
        </div>
      </div>
    </aside>
  );
}
