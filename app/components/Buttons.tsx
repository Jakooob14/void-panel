'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface DefaultProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface LinkProps extends DefaultProps {
  href: string;
  rel?: string;
}

export function LinkButton({ children, className, href, rel = 'noreferrer', ...props }: LinkProps) {
  return (
    <Link className={'block px-4 py-1.5 bg-aero-500 !text-black transition-[background] hover:bg-aero-600 text-center ' + className} href={href} rel={rel} {...props}>
      {children}
    </Link>
  );
}
export function AnchorButton({ children, className, onClick, ...props }: DefaultProps) {
  return (
    <a className={'block px-4 py-1.5 bg-aero-500 !text-black transition-[background] hover:bg-aero-600 cursor-pointer text-center ' + className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

export function OutlineButton({ children, className, onClick, ...props }: DefaultProps) {
  return (
    <a
      className={'block text-white border-aero-500 border-2 px-[14px] py-[4px] transition-all hover:!text-black hover:bg-aero-600 hover:border-aero-600 cursor-pointer text-center ' + className}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  );
}
