'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read current locale from cookie
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
    const currentLocale = match ? match[1] : 'en';
    setLocale(currentLocale);
    setMounted(true);
  }, []);

  const handleToggleLocale = (newLocale: 'en' | 'fr') => {
    // Set cookie with 1-year expiry
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    setLocale(newLocale);
    // Refresh to re-render server components
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleToggleLocale('en')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleToggleLocale('fr')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          locale === 'fr'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        FR
      </button>
    </div>
  );
}
