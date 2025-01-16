import type { Metadata } from 'next';
import './globals.scss';
import Sidebar from '@/app/components/Sidebar';
import { ToastProvider } from '@/app/components/ToastController';
import { ModalProvider } from '@/app/components/ModalController';

export const metadata: Metadata = {
  title: 'Void Panel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={'antialiased'}>
        <ToastProvider>
          <ModalProvider>
            <Sidebar />
            <div className={'ms-[348px] me-6'}>{children}</div>
          </ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
