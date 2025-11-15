import { GeneralPermissions, isAllowed } from '@/app/utilities/permissions';
import { redirect } from 'next/navigation';
import { Heading1, Heading2 } from '@/app/components/Headings';
import prisma from '@/app/utilities/prisma';
import { getUserTotalFilesSize } from '@/app/utilities/dto/user';
import formatBytes from '@/app/utilities/formatBytes';
import { addUserToWhitelist } from '@/app/actions/user';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// --- SERVER ACTION ---
async function addWhitelistAction(formData: FormData) {
  'use server';

  const email = formData.get('email')?.toString().trim();
  if (!email) return 'Zadej e-mail';

  const res = await addUserToWhitelist(email);

  // auto-refresh page if success
  if (res === true) {
    revalidatePath('/admin');
    return 'Přidáno!';
  }

  return res;
}

async function removeWhitelistAction(formData: FormData) {
  'use server';

  const email = formData.get('email');
  if (!email) return;

  await prisma.userWhitelist.delete({
    where: { email: String(email) },
  });

  revalidatePath('/admin');
}

export default async function Admin() {
  if (!(await isAllowed(GeneralPermissions.viewAdminPanel))) redirect('/');

  const users = await prisma.user.findMany();
  const whitelist = await prisma.userWhitelist.findMany();

  return (
    <main>
      <Heading1>Administrace</Heading1>

      <div className='my-12'>
        <Heading2>Whitelist uživatelů</Heading2>
        {/* @ts-expect-error temp */}
        <form action={addWhitelistAction} className='flex flex-row gap-4 mt-4'>
          <input type='email' name='email' placeholder='E-Mail' className='bg-alt-gray-200 p-3 rounded w-64' required />
          <button type='submit' className='bg-aero-600 text-white px-4 py-2 rounded hover:bg-aero-700'>
            Přidat
          </button>
        </form>

        <table className='w-full my-4'>
          <thead>
            <tr>
              <th className='text-start p-4 bg-alt-gray-100'>E-Mail</th>
            </tr>
          </thead>
          <tbody>
            {whitelist.length > 0 ? (
              whitelist.map((item, index) => (
                <tr key={item.email} className={`bg-alt-gray-200 ${index < whitelist.length - 1 ? 'border-b-2' : ''} border-alt-gray-250`}>
                  <td className='p-4 flex justify-between items-center'>
                    {item.email}
                    <form action={removeWhitelistAction}>
                      <input type='hidden' name='email' value={item.email} />
                      <button type='submit' className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'>
                        Odebrat
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr className={'bg-alt-gray-200'}>
                <td className='p-4 text-neutral-500'>Žádné položky</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <Heading2>Soubory</Heading2>
        <table className={'w-full my-4'}>
          <thead>
            <tr>
              <th className={'text-start p-4 bg-alt-gray-100'}>Uživatel</th>
              <th className={'text-start p-4 bg-alt-gray-100'}>E-Mail</th>
              <th className={'text-start w-[30%] p-4 bg-alt-gray-100'}>Úložiště</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 &&
              users.map(async (user, index) => {
                const totalSize = await getUserTotalFilesSize(user.id);
                const totalSizePercentage = (totalSize || 0 / Number(user.maxStorage)) * 100;

                return (
                  <tr className={`bg-alt-gray-200 ${index < users.length - 1 ? 'border-b-2' : ''} border-alt-gray-250`} key={user.id}>
                    <td className={'p-4'}>{user.username}</td>
                    <td className={'p-4'}>{user.email}</td>
                    <td className={'flex flex-row items-center gap-4 p-4'}>
                      {totalSize !== null ? (
                        <div
                          className={`w-[25%] font-semibold ${
                            totalSizePercentage > 95 && Number(user.maxStorage) !== -1 ? 'text-red-500' : totalSizePercentage > 90 && Number(user.maxStorage) !== -1 && 'text-yellow-500'
                          }`}
                        >
                          {formatBytes(totalSize || 0, 2)} / {Number(user.maxStorage) === -1 ? '∞ ZB' : formatBytes(Number(user.maxStorage))}
                        </div>
                      ) : (
                        'Chyba'
                      )}

                      <div className={'w-1/3 h-1 bg-alt-gray-300'}>
                        <div
                          className={`bg-aero-500 transition-all h-full ${
                            Number(user.maxStorage) === -1 ? 'rainbow-background' : totalSizePercentage > 95 ? 'bg-red-500' : totalSizePercentage > 90 && 'bg-yellow-500'
                          }`}
                          style={{
                            width: (Number(user.maxStorage) === -1 ? 100 : totalSizePercentage) + '%',
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
