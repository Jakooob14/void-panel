'use client';

import { SWRConfig } from 'swr';
import { useRouter } from 'next/navigation';

export default function Client({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const baseFetcher = async (url: string | URL | Request) => {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Global fetch auth handling
        if (response.status === 401) {
          router.push('/login');
        } else if (response.status === 403) {
          router.push('/login');
        }
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  };

  return (
    <SWRConfig value={{ fetcher: baseFetcher }}>
      <div className={'ms-[348px] me-6'}>{children}</div>
    </SWRConfig>
  );
}
