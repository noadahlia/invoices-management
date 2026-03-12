'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/src/lib/supabase';
import MessageModal, { type MessageType } from '@/src/components/ErrorModal';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }

    setMessage({ type: 'success', text: t('login_success') });
    setTimeout(() => router.push('/'), 1500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }

    setMessage({ type: 'success', text: t('signup_success') });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('page_title')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('connect_prompt')}</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('email_label')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all"
                placeholder={t('email_placeholder')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('password_label')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? t('login_button_connecting') : t('login_button')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">{t('no_account')}</p>
            <button
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="w-full rounded-xl border border-indigo-600 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              {loading ? t('signup_button_registering') : t('signup_button')}
            </button>
          </div>
        </div>
      </div>

      <MessageModal
        open={message !== null}
        onOpenChange={(open) => !open && setMessage(null)}
        type={message?.type}
        message={message?.text || ''}
      />
    </div>
  );
}
