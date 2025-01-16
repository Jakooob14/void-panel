import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  className?: string;
  otherClassName?: string;
  label?: ReactNode;
}

export function Input({ children, className, label = '', ...props }: InputProps) {
  return (
    <label className={className}>
      {label}
      <input className={'bg-alt-gray-250 border-2 border-alt-gray-300 outline-0 px-4 py-2 transition-all enabled:hover:bg-alt-gray-300 disabled:brightness-75 ' + className} {...props} />
      {children}
    </label>
  );
}

export function InputInnerLabel({ children, className, otherClassName, label = '', ...props }: InputProps) {
  return (
    <label className={'bg-alt-gray-250 border-2 border-alt-gray-300 px-2 py-1 transition-colors hover:bg-alt-gray-300 ' + className}>
      {label}
      <input className={'outline-0 ' + otherClassName} {...props} />
      {children}
    </label>
  );
}
