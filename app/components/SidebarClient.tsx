'use client';

import { AnchorButton, LinkButton } from '@/app/components/Buttons';
import { Heading1 } from '@/app/components/Headings';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ImEnter, ImExit } from 'react-icons/im';
import { IoPersonSharp } from 'react-icons/io5';
import { IoMdHome } from 'react-icons/io';
import { RiFolder6Fill } from 'react-icons/ri';
import { FaUserPlus } from 'react-icons/fa6';
import Image from 'next/image';

interface SidebarProps {
  user?: {
    username: string;
    email: string;
    avatar: string;
  } | null;
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
        <ul className={'mt-5 flex flex-col gap-6 w-[100%]'}>
          <li>
            <LinkButton className={'w-full flex justify-between items-center'} href={'/'}>
              Domů
              <IoMdHome className={'-me-0.5 text-2xl'} />
            </LinkButton>
          </li>
          {user && (
            <>
              <li>
                <LinkButton className={'w-full flex justify-between items-center'} href={'/share'}>
                  Soubory
                  <RiFolder6Fill className={'text-xl'} />
                </LinkButton>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={'relative'}>
        <hr className={'border-alt-gray-200 border-t-2 my-2'} />
        {user ? (
          <SidebarProfile user={user} handleLogout={handleLogout} />
        ) : (
          <>
            <ul className={'flex flex-col gap-6 mb-4 mt-6'}>
              <li>
                <LinkButton className={'w-full flex justify-between items-center'} href={'/signup'}>
                  Registrace
                  <FaUserPlus className={'text-xl'} />
                </LinkButton>
              </li>
              <li>
                <LinkButton className={'w-full flex justify-between items-center'} href={'/login'}>
                  Přihlášení
                  <ImEnter className={'text-xl mr-1'} />
                </LinkButton>
              </li>
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}

interface SidebarProfileProps extends SidebarProps {
  handleLogout: () => void;
}

function SidebarProfile({ handleLogout, user }: SidebarProfileProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    function callback(e: MouseEvent) {
      if (!accountMenuRef.current) return;

      let node: HTMLElement | null = e.target as HTMLElement;
      while (node && node !== accountMenuRef.current && node.nodeName !== 'BODY') {
        node = node.parentElement;
      }
      if (node !== accountMenuRef.current) {
        setIsAccountMenuOpen(false);
      }
    }

    window.addEventListener('click', callback);
    return () => window.removeEventListener('click', callback);
  }, []);

  if (!user) return null;

  return (
    <div ref={accountMenuRef}>
      <motion.div
        className={'bg-alt-gray-50 p-6 absolute bottom-full w-full transition-all shadow-lg'}
        initial={{
          opacity: 0,
          display: 'none',
        }}
        animate={{
          opacity: isAccountMenuOpen ? 1 : 0,
          display: isAccountMenuOpen ? 'block' : 'none',
        }}
        transition={{
          duration: 0.07,
        }}
      >
        <ul className={'flex flex-col gap-6 w-full'}>
          <li>
            <LinkButton className={'w-full flex justify-between items-center'} href={'/profile'} onClick={() => setIsAccountMenuOpen(false)}>
              Zobrazit profil
              <IoPersonSharp className={'text-xl mr-0.5'} />
            </LinkButton>
          </li>
          <li>
            <AnchorButton
              className={'w-full flex justify-between items-center'}
              onClick={() => {
                setIsAccountMenuOpen(false);
                handleLogout();
              }}
            >
              Odhlásit
              <ImExit className={'text-xl'} />
            </AnchorButton>
          </li>
        </ul>
      </motion.div>
      <div className={'flex items-center p-4 transition-colors hover:bg-alt-gray-50 cursor-default'} onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
        <Image className={'min-w-[48px] h-[48px] bg-aeroGradient rounded-full overflow-hidden'} width={48} height={48} src={user.avatar} alt={'Avatar'} unoptimized={true} />
        <div className={'flex flex-col ps-4 truncate'}>
          <span className={'truncate'} title={user?.username}>
            {user?.username}
          </span>
          <span className={'truncate text-sm text-alt-gray-800'} title={user?.email}>
            {user?.email}
          </span>
        </div>
      </div>
    </div>
  );
}
