'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function CTASection() {
  const { language } = useLanguage();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          {language === 'id' ? 'Siap untuk bergabung?' : 'Ready to Join?'}
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          {language === 'id'
            ? 'Jadilah bagian dari komunitas pelajar Indonesia terbesar di Queensland'
            : 'Become part of the largest Indonesian student community in Queensland'}
        </p>
        <Link
          href="/auth/register"
          className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition transform hover:scale-105"
        >
          {getTranslation(translations.navigation.register, language)}
        </Link>
      </div>
    </section>
  );
}
