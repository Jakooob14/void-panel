import 'server-only';
import { getCurrentUserId } from '@/app/actions/session';
import prisma from '@/app/utilities/prisma';

export enum GeneralPermissions {
  viewAdminPanel = 'view:admin_panel',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  accessRemoteComputer = 'view:admin_panel', // TODO: access:remote_computer
}

export enum FilePermissions {
  manageUsersStorage = 'manage:users_storage',
}

type Permission = GeneralPermissions | FilePermissions;

export async function isAllowed(permission: Permission, userIdToCheck?: string) {
  let userId: string | undefined | null = userIdToCheck;
  if (!userId) userId = await getCurrentUserId();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      permissions: true,
    },
  });

  return user ? user.permissions.includes(permission) : false;
}
