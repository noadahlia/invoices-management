'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function LogoutButton() {
  const router = useRouter();
  const t = useTranslations('components.logout_button');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
    >
      <LogOut className="w-4 h-4" />
      {t('button')}
    </button>
  );
}
