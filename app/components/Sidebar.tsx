'use server';

import SidebarClient from '@/app/components/SidebarClient';
import { getCurrentUsername } from '@/app/utilities/dto/user';

export default async function Sidebar() {
  const username = await getCurrentUsername();

  return <SidebarClient user={username ? { username: username } : undefined} />;
}
