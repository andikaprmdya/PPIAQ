'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function NewsletterSection() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setEmail('');
        setMessage(data.message);
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setMessage(language === 'id' ? 'Terjadi kesalahan. Coba lagi.' : 'An error occurred. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          {getTranslation(translations.home.stayInTouch.title, language)}
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          {getTranslation(translations.home.stayInTouch.description, language)}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={language === 'id' ? 'Email Anda' : 'Your email'}
            required
            className="flex-1 px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-yellow-300 hover:text-gray-900 disabled:opacity-50 transition"
          >
            {isLoading ? (language === 'id' ? 'Subscribing...' : 'Subscribing...') : language === 'id' ? 'Subscribe' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
