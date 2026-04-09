'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      const redirectUrl = result.redirectTo || '/community-board';
      router.push(redirectUrl);
    } catch {
      setError(language === 'id' ? 'Terjadi kesalahan jaringan' : 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 overflow-x-hidden flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-nickainley text-2xl text-[#886644] mb-2">
            {language === 'id' ? 'Selamat Datang Kembali' : 'Welcome Back'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl text-[#B64847] uppercase tracking-tighter mb-4">
            {language === 'id' ? 'Masuk' : 'Sign In'}
          </h1>
          <div className="w-12 h-1 bg-[#FEB602] rounded-full mx-auto"></div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-[#E4DBCA] p-8 shadow-lg">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                {language === 'id' ? 'Email' : 'Email Address'} *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                placeholder={language === 'id' ? 'Email Anda' : 'your@email.com'}
              />
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                {language === 'id' ? 'Kata Sandi' : 'Password'} *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#303030] transition-all disabled:opacity-50 mt-8"
            >
              {isLoading ? (language === 'id' ? 'Sedang masuk...' : 'Signing in...') : (language === 'id' ? 'Masuk' : 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-[#E4DBCA]"></div>

          {/* Register Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">
              {language === 'id' ? 'Belum punya akun? ' : "Don't have an account? "}
            </span>
            <Link href="/auth/register" className="text-[#B64847] font-bold hover:underline">
              {language === 'id' ? 'Daftar di sini' : 'Sign up here'}
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 text-center text-xs text-gray-500 italic">
          <p>
            {language === 'id'
              ? '🔐 Data Anda dilindungi dengan enkripsi'
              : '🔐 Your data is protected with encryption'}
          </p>
          <p className="mt-2 not-italic text-gray-600">
            {language === 'id'
              ? 'Daftar akun terlebih dahulu. Login hanya bisa setelah admin approve. Email status akan dikirim saat pending, approved, atau rejected.'
              : 'Register first. Sign in is available only after admin approval. Status emails are sent for pending, approved, and rejected.'}
          </p>
        </div>
      </div>
    </main>
  );
}
