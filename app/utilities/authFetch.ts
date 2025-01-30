import { redirect } from 'next/navigation';

export default async function authFetch(input: string | URL | Request, relative = true, init?: RequestInit | undefined): Promise<Response> {
  if (relative && !process.env.BASE_URL) throw new Error('Environment BASE_URL not defined');

  const file = await fetch(relative ? (process.env.BASE_URL || '') + input : input, init);

  if (file.status === 401 || file.status === 403) {
    redirect('/login');
  }

  if (!file.ok) {
    console.error(`Failed to fetch file: ${file.statusText}`);
  }

  return file;
}
