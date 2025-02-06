'use server';

import { headers } from 'next/headers';

export async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get('host') || 'could-not-get-base-url';
  const protocol = process.env.NODE_ENV === 'production' || host.endsWith('ngrok-free.app') ? 'https' : 'http';
  return `${protocol}://${host}`;
}
