import { GeneralPermissions, isAllowed } from '@/app/utilities/permissions';
import { redirect } from 'next/navigation';
import { Heading1, Heading2 } from '@/app/components/Headings';
import prisma from '@/app/utilities/prisma';
import { getUserTotalFilesSize } from '@/app/utilities/dto/user';
import formatBytes from '@/app/utilities/formatBytes';

export default async function Admin() {
  if (!(await isAllowed(GeneralPermissions.viewAdminPanel))) redirect('/');

  const users = await prisma.user.findMany();

  return (
    <main>
      <Heading1>Administrace</Heading1>
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
                          className={`w-[25%] font-semibold ${totalSizePercentage > 95 && Number(user.maxStorage) !== -1 ? 'text-red-500' : totalSizePercentage > 90 && Number(user.maxStorage) !== -1 && 'text-yellow-500'}`}
                        >
                          {formatBytes(totalSize || 0, 2)} / {Number(user.maxStorage) === -1 ? '∞ ZB' : formatBytes(Number(user.maxStorage))}
                        </div>
                      ) : (
                        'Chyba'
                      )}

                      <div className={'w-1/3 h-1 bg-alt-gray-300'}>
                        <div
                          className={`bg-aero-500 transition-all h-full ${Number(user.maxStorage) === -1 ? 'rainbow-background' : totalSizePercentage > 95 ? 'bg-red-500' : totalSizePercentage > 90 && 'bg-yellow-500'}`}
                          style={{ width: (Number(user.maxStorage) === -1 ? 100 : totalSizePercentage) + '%' }}
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
