'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || (language === 'id' ? 'Permintaan gagal' : 'Request failed'));
        return;
      }

      setSuccess(
        data.message ||
          (language === 'id'
            ? 'Jika email terdaftar, kami sudah mengirim link reset password.'
            : 'If your email exists, we sent a reset password link.')
      );
      setEmail('');
    } catch {
      setError(language === 'id' ? 'Terjadi kesalahan jaringan' : 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <p className="font-nickainley text-2xl text-[#886644] mb-2">
            {language === 'id' ? 'Bantuan Akun' : 'Account Recovery'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl text-[#B64847] uppercase tracking-tighter mb-4">
            {language === 'id' ? 'Lupa Password' : 'Forgot Password'}
          </h1>
          <div className="w-12 h-1 bg-[#FEB602] rounded-full mx-auto"></div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4DBCA] p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            {language === 'id'
              ? 'Masukkan email Anda. Jika terdaftar, kami kirim link reset password ke email tersebut.'
              : 'Enter your email. If it is registered, we will send a reset link to that email.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors"
              >
                {language === 'id' ? 'Email' : 'Email Address'} *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                placeholder={language === 'id' ? 'Email Anda' : 'your@email.com'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#303030] transition-all disabled:opacity-50"
            >
              {isLoading
                ? language === 'id'
                  ? 'Mengirim...'
                  : 'Sending...'
                : language === 'id'
                  ? 'Kirim Link Reset'
                  : 'Send Reset Link'}
            </button>
          </form>

          <div className="my-6 border-t border-[#E4DBCA]"></div>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-[#B64847] font-bold hover:underline">
              {language === 'id' ? 'Kembali ke Login' : 'Back to Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
