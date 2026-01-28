'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function PestaRakyatPage() {
  const { language } = useLanguage();

  const events = [
    {
      title: language === 'id' ? 'Konser Musik' : 'Live Concert',
      description: language === 'id'
        ? 'Nikmati pertunjukan musik dari artis Indonesia terbaik'
        : 'Enjoy performances from top Indonesian artists',
      date: '2026-08-17',
      time: '17:00',
      icon: '🎵'
    },
    {
      title: language === 'id' ? 'Festival Kuliner' : 'Food Festival',
      description: language === 'id'
        ? 'Cicipi masakan tradisional Indonesia yang lezat'
        : 'Taste delicious traditional Indonesian cuisine',
      date: '2026-08-17',
      time: '12:00',
      icon: '🍜'
    },
    {
      title: language === 'id' ? 'Pameran Budaya' : 'Cultural Showcase',
      description: language === 'id'
        ? 'Saksikan kesenian dan budaya Indonesia langsung'
        : 'Witness Indonesian arts and culture firsthand',
      date: '2026-08-17',
      time: '13:00',
      icon: '🎭'
    },
    {
      title: language === 'id' ? 'Parade & Kostum' : 'Parade & Costumes',
      description: language === 'id'
        ? 'Ikuti parade meriah dengan kostum tradisional Indonesia'
        : 'Join the festive parade with traditional Indonesian costumes',
      date: '2026-08-17',
      time: '15:00',
      icon: '🎪'
    },
    {
      title: language === 'id' ? 'Pertandingan Olahraga' : 'Sports Competition',
      description: language === 'id'
        ? 'Ikut serta dalam berbagai kompetisi olahraga seru'
        : 'Participate in exciting sports competitions',
      date: '2026-08-17',
      time: '10:00',
      icon: '⚽'
    },
    {
      title: language === 'id' ? 'Fireworks' : 'Fireworks Display',
      description: language === 'id'
        ? 'Saksikan pertunjukan kembang api spektakuler'
        : 'Watch the spectacular fireworks display',
      date: '2026-08-17',
      time: '20:00',
      icon: '🎆'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {getTranslation(translations.pestaRakyat.title, language)}
          </h1>
          <p className="text-2xl text-white font-semibold mb-4">
            {getTranslation(translations.pestaRakyat.subtitle, language)}
          </p>
          <p className="text-lg text-gray-100">
            {getTranslation(translations.pestaRakyat.description, language)}
          </p>
        </div>
      </section>

      {/* Event Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {language === 'id' ? '17 Agustus 2026' : 'August 17, 2026'}
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              {language === 'id'
                ? 'Perayaan Hari Kemerdekaan Indonesia terbesar di Queensland'
                : "Queensland's Largest Indonesian Independence Day Celebration"}
            </p>
            <p className="text-gray-600">
              {language === 'id'
                ? 'Bergabunglah dengan ribuan pelajar Indonesia dan keluarga diaspora untuk perayaan budaya yang tak terlupakan!'
                : 'Join thousands of Indonesian students and diaspora families for an unforgettable cultural celebration!'}
            </p>
          </div>

          {/* Events Timeline */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {language === 'id' ? 'Jadwal Acara' : 'Event Schedule'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {events.map((event, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition border-t-4 border-red-500">
                <div className="text-4xl mb-4">{event.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>⏰ {event.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Volunteer Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {getTranslation(translations.pestaRakyat.volunteer.title, language)}
            </h2>
            <p className="text-lg text-blue-100 mb-6">
              {getTranslation(translations.pestaRakyat.volunteer.description, language)}
            </p>
            <p className="text-gray-100 mb-6">
              {language === 'id'
                ? 'Kami membutuhkan tim acara untuk membantu mengorganisir Pesta Rakyat 2026. Berbagai peran tersedia!'
                : 'We need an events team to help organize Pesta Rakyat 2026. Various roles are available!'}
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              {getTranslation(translations.pestaRakyat.volunteer.button, language)}
            </Link>
          </div>

          {/* Location & Details */}
          <div className="mt-12 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-8 border-t-4 border-red-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {language === 'id' ? 'Lebih Banyak Informasi' : 'More Information'}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'id' ? 'Lokasi' : 'Location'}
                </h3>
                <p className="text-gray-800">
                  {language === 'id'
                    ? 'Lokasi akan diumumkan segera. Ikuti media sosial kami untuk update.'
                    : 'Location to be announced soon. Follow our social media for updates.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'id' ? 'Tiket' : 'Tickets'}
                </h3>
                <p className="text-gray-800">
                  {language === 'id'
                    ? 'Akses gratis untuk semua! Daftar online untuk mengamankan tempat Anda.'
                    : 'Free admission for all! Register online to secure your spot.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'id' ? 'Pertanyaan?' : 'Questions?'}
                </h3>
                <p className="text-gray-800">
                  {language === 'id'
                    ? 'Hubungi kami melalui Instagram @ppiaqueensland atau email info@ppiaq.org'
                    : 'Contact us via Instagram @ppiaqueensland or email info@ppiaq.org'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
