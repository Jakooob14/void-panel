import ProfileClient from '@/app/profile/Profile';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/utilities/dto/user';

export default async function Profile() {
  const profile = await getProfile();
  if (!profile) redirect('/share');

  return <ProfileClient name={profile.username} email={profile.email} />;
}
