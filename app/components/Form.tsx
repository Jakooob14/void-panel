'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { FaXmark } from 'react-icons/fa6';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  className?: string;
  otherClassName?: string;
  label?: ReactNode;
}

export function Input({ children, className, label = '', ...props }: InputProps) {
  return (
    <label className={'flex flex-col text-alt-gray-800 ' + className}>
      {label}
      <input
        className={
          `${props.type === 'submit' ? 'bg-aero-500 !border-0 px-5 py-2.5 enabled:hover:bg-aero-600 !text-black cursor-pointer' : 'bg-alt-gray-250 border-alt-gray-300 enabled:hover:bg-alt-gray-300'} text-white border-2 outline-0 px-4 py-2 transition-all disabled:brightness-75 disabled:cursor-not-allowed ` +
          className
        }
        {...props}
      />
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

export function CheckboxInput({ children, className, label = '', ...props }: InputProps) {
  return (
    <label className={'flex flex-col text-alt-gray-800 ' + className}>
      {label}
      <div className={'w-6 h-6 bg-white flex justify-center items-center has-[:checked]:bg-aero-500 transition-colors'}>
        <input className={'hidden peer'} type={'checkbox'} {...props} />
        <FaXmark className={'peer-checked:block hidden text-black transition-all text-xl'} />
      </div>
      {children}
    </label>
  );
}
