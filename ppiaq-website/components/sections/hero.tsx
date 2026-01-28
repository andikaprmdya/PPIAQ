'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function HeroSection() {
  const { language } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {getTranslation(translations.home.welcome.title, language)}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          {getTranslation(translations.home.welcome.subtitle, language)}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/membership"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            {getTranslation(translations.home.cta.joinMembership, language)}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
          >
            {getTranslation(translations.home.cta.guideBook, language)}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg border border-white/40">
            <div className="text-4xl font-bold text-white">4</div>
            <div className="text-sm text-white font-semibold">
              {language === 'id' ? 'Cabang' : 'Branches'}
            </div>
          </div>
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg border border-white/40">
            <div className="text-4xl font-bold text-white">500+</div>
            <div className="text-sm text-white font-semibold">
              {language === 'id' ? 'Anggota' : 'Members'}
            </div>
          </div>
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg border border-white/40">
            <div className="text-4xl font-bold text-white">10+</div>
            <div className="text-sm text-white font-semibold">
              {language === 'id' ? 'Acara/Tahun' : 'Events/Year'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
