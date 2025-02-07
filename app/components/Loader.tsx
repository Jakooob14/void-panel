import '@/app/loading.scss';
import { HTMLAttributes } from 'react';

export default function Loader({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={'loader ' + className} {...props}></span>;
}
