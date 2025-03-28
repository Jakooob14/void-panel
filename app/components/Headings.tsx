'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

export function Heading1({ children, className = '', ...props }: HeadingProps) {
  return (
    <h1 className={'text-[max(60px,15vw)] sm:text-8xl w-fit tracking-wider -ms-1 font-bold bg-clip-text text-transparent bg-aeroGradient pb-2 ' + className} {...props}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className = '', ...props }: HeadingProps) {
  return (
    <h2 className={'text-[max(28px,7.5vw)] sm:text-5xl w-fit tracking-wide font-[480] ' + className} {...props}>
      {children}
    </h2>
  );
}
