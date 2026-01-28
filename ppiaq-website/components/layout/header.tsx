'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';
import { useState } from 'react';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: translations.navigation.home, href: '/' },
    { label: translations.navigation.about, href: '/about' },
    { label: translations.navigation.membership, href: '/membership' },
    { label: translations.navigation.pestaRakyat, href: '/pesta-rakyat' },
    { label: translations.navigation.contact, href: '/contact' },
  ];

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            PPIA Queensland
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <Link
                key={getTranslation(item.label, language)}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition"
              >
                {getTranslation(item.label, language)}
              </Link>
            ))}
          </div>

          {/* Auth & Language */}
          <div className="flex gap-4 items-center">
            {/* Language Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2 py-1 rounded ${
                  language === 'id'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                ID
              </button>
            </div>

            {/* Auth Links */}
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-blue-600"
            >
              {getTranslation(translations.navigation.login, language)}
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {getTranslation(translations.navigation.register, language)}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={getTranslation(item.label, language)}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {getTranslation(item.label, language)}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
