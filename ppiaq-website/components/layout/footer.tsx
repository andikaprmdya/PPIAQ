'use client';

import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';
import Link from 'next/link';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">PPIA Queensland</h3>
            <p className="text-gray-300 text-sm">
              {language === 'id'
                ? 'Perhimpunan Pelajar Indonesia di Australia - Cabang Queensland'
                : 'The Indonesian Student Association in Australia - Queensland Chapter'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {language === 'id' ? 'Tautan Cepat' : 'Quick Links'}
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                {getTranslation(translations.navigation.home, language)}
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition">
                {getTranslation(translations.navigation.about, language)}
              </Link>
              <Link href="/membership" className="text-gray-300 hover:text-white transition">
                {getTranslation(translations.navigation.membership, language)}
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition">
                {getTranslation(translations.navigation.contact, language)}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {language === 'id' ? 'Hubungi Kami' : 'Contact'}
            </h3>
            <div className="text-sm text-gray-300">
              <p className="mb-2">📧 info@ppiaq.org</p>
              <p className="mb-4">📍 Queensland, Australia</p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/ppiaqueensland"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com/ppiaqueensland"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400 text-sm">
            {getTranslation(translations.footer.copyright, language)}
          </p>
        </div>
      </div>
    </footer>
  );
}
