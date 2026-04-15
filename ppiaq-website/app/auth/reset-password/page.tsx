'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function ResetPasswordPage() {
  const { language } = useLanguage();
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError(language === 'id' ? 'Token reset tidak valid.' : 'Invalid reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === 'id'
          ? 'Konfirmasi password tidak cocok.'
          : 'Password confirmation does not match.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'id' ? 'Reset gagal' : 'Reset failed'));
        return;
      }

      setSuccess(
        data.message ||
          (language === 'id'
            ? 'Password berhasil direset. Silakan login.'
            : 'Password reset successful. You can now sign in.')
      );
      setPassword('');
      setConfirmPassword('');
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
            {language === 'id' ? 'Keamanan Akun' : 'Account Security'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl text-[#B64847] uppercase tracking-tighter mb-4">
            {language === 'id' ? 'Reset Password' : 'Reset Password'}
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

          {!token && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-yellow-800 font-medium text-sm">
                {language === 'id'
                  ? 'Link reset tidak valid. Silakan minta link baru dari halaman Lupa Password.'
                  : 'This reset link is invalid. Please request a new link from Forgot Password.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors"
              >
                {language === 'id' ? 'Password Baru' : 'New Password'} *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="group">
              <label
                htmlFor="confirm-password"
                className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors"
              >
                {language === 'id' ? 'Konfirmasi Password' : 'Confirm Password'} *
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full px-6 py-3 bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#303030] transition-all disabled:opacity-50"
            >
              {isLoading
                ? language === 'id'
                  ? 'Menyimpan...'
                  : 'Saving...'
                : language === 'id'
                  ? 'Simpan Password Baru'
                  : 'Save New Password'}
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
