import type { Metadata } from 'next';
import './globals.scss';
import { ToastProvider } from '@/app/components/ToastController';
import { ModalProvider } from '@/app/components/ModalController';
import Client from '@/app/Client';
import Sidebar from '@/app/components/Sidebar';

export const metadata: Metadata = {
  title: 'Void Panel',
};

export default async function RootLayout({
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
            <Client>{children}</Client>
          </ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
