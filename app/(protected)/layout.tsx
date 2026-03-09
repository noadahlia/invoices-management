import { redirect } from 'next/navigation';
import { getServerSession } from '@/src/lib/server-auth';
import LogoutButton from '@/src/components/LogoutButton';

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
      <div className="flex justify-end p-8">
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
