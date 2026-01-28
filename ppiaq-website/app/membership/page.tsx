'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function MembershipPage() {
  const { language } = useLanguage();

  const benefits = [
    { id: 'pricing', label: language === 'id' ? 'Harga Eksklusif' : 'Exclusive Pricing' },
    { id: 'access', label: language === 'id' ? 'Akses Awal' : 'Early Access' },
    { id: 'community', label: language === 'id' ? 'Papan Komunitas' : 'Community Board' },
    { id: 'newsletter', label: language === 'id' ? 'Newsletter' : 'Newsletter' },
    { id: 'events', label: language === 'id' ? 'Acara Khusus' : 'Special Events' },
    { id: 'discounts', label: language === 'id' ? 'Diskon Mitra' : 'Partner Discounts' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {getTranslation(translations.membership.title, language)}
          </h1>
          <p className="text-xl text-blue-100">
            {getTranslation(translations.membership.description, language)}
          </p>
        </div>
      </section>

      {/* Membership Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Ordinary Membership */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {getTranslation(translations.membership.ordinary.title, language)}
                </h2>
                <p className="text-blue-100 mb-4">
                  {getTranslation(translations.membership.ordinary.description, language)}
                </p>
                <div className="text-4xl font-bold">$10 AUD</div>
                <p className="text-sm text-blue-100">{language === 'id' ? 'per tahun' : 'per year'}</p>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">{benefit.label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/auth/register"
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {language === 'id' ? 'Daftar Sekarang' : 'Sign Up Now'}
                </Link>
              </div>
            </div>

            {/* Associate Membership */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {getTranslation(translations.membership.associate.title, language)}
                </h2>
                <p className="text-purple-100 mb-4">
                  {getTranslation(translations.membership.associate.description, language)}
                </p>
                <div className="text-4xl font-bold">$10 AUD</div>
                <p className="text-sm text-purple-100">{language === 'id' ? 'per tahun' : 'per year'}</p>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">{benefit.label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/auth/register"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  {language === 'id' ? 'Daftar Sekarang' : 'Sign Up Now'}
                </Link>
              </div>
            </div>
          </div>

          {/* Benefits Table */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {language === 'id' ? 'Apa yang Anda Dapatkan' : 'What You Get'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-4 px-6 text-gray-900 font-semibold">
                      {language === 'id' ? 'Benefit' : 'Benefit'}
                    </th>
                    <th className="text-center py-4 px-6 text-gray-900 font-semibold">
                      {language === 'id' ? 'Biasa' : 'Ordinary'}
                    </th>
                    <th className="text-center py-4 px-6 text-gray-900 font-semibold">
                      {language === 'id' ? 'Asosiasi' : 'Associate'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: language === 'id' ? 'Harga Event' : 'Event Pricing', ordinary: '✓', associate: '✓' },
                    { name: language === 'id' ? 'Akses Awal Program' : 'Early Program Access', ordinary: '✓', associate: '✓' },
                    { name: language === 'id' ? 'Papan Komunitas' : 'Community Board', ordinary: '✓', associate: '✓' },
                    { name: language === 'id' ? 'Newsletter Mingguan' : 'Weekly Newsletter', ordinary: '✓', associate: '✓' },
                    { name: language === 'id' ? 'Acara Networking' : 'Networking Events', ordinary: '✓', associate: '✓' },
                    { name: language === 'id' ? 'Diskon Mitra' : 'Partner Discounts', ordinary: '✓', associate: '✓' },
                  ].map((benefit, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-4 px-6 text-gray-700">{benefit.name}</td>
                      <td className="py-4 px-6 text-center text-green-600 font-bold">{benefit.ordinary}</td>
                      <td className="py-4 px-6 text-center text-green-600 font-bold">{benefit.associate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ for Membership */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg">
              {language === 'id' ? 'Pertanyaan tentang Keanggotaan' : 'Membership Questions'}
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border-l-4 border-blue-600">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Bagaimana cara menjadi anggota?' : 'How do I become a member?'}
                  </h3>
                  <p className="text-gray-800">
                    {language === 'id'
                      ? 'Klik tombol "Daftar Sekarang" dan ikuti proses pendaftaran multi-langkah kami. Anda akan memilih jenis keanggotaan dan universitas Anda selama pendaftaran.'
                      : 'Click the "Sign Up Now" button and follow our multi-step registration process. You will select your membership type and university during registration.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Apakah ada perbedaan antara kedua jenis keanggotaan?' : 'Is there a difference between the two membership types?'}
                  </h3>
                  <p className="text-gray-800">
                    {language === 'id'
                      ? 'Kedua jenis keanggotaan mendapatkan manfaat yang sama. Jenis anggota biasa untuk warga negara Indonesia, dan asosiasi untuk mereka dengan warisan Indonesia.'
                      : 'Both membership types receive the same benefits. Ordinary membership is for Indonesian citizens, and Associate membership is for those with Indonesian heritage.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Berapa lama keanggotaan berlaku?' : 'How long is the membership valid?'}
                  </h3>
                  <p className="text-gray-800">
                    {language === 'id'
                      ? 'Keanggotaan berlaku selama 12 bulan dari tanggal pendaftaran Anda.'
                      : 'Membership is valid for 12 months from your registration date.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
