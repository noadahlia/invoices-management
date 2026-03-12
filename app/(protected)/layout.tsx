import { redirect } from 'next/navigation';
import { getServerSession } from '@/src/lib/server-auth';
import LogoutButton from '@/src/components/LogoutButton';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await getServerSession();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-end gap-4 p-8">
        <LanguageSwitcher />
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
