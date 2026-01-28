'use client';

import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

const UNIVERSITIES = [
  {
    name: 'PPIA Griffith University (ISAGU)',
    email: 'isagu@griffith.edu.au',
    instagram: '@isagu_official',
  },
  {
    name: 'PPIA James Cook University (JCU ISA)',
    email: 'jcuisa@jcu.edu.au',
    instagram: '@jcu_isa',
  },
  {
    name: 'PPIA University of Queensland (UQISA)',
    email: 'uqisa@uq.edu.au',
    instagram: '@uq_isa',
  },
  {
    name: 'PPIA Queensland University of Technology (ISAQ)',
    email: 'isaq@qut.edu.au',
    instagram: '@isaq_official',
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Ahmad Wijaya',
    role: { id: 'Ketua', en: 'President' },
    university: 'University of Queensland',
    instagram: '@ahmadwijaya',
  },
  {
    name: 'Siti Nurhaliza',
    role: { id: 'Sekretaris', en: 'Secretary' },
    university: 'Griffith University',
    instagram: '@sitihaliza',
  },
  {
    name: 'Budi Santoso',
    role: { id: 'Bendahara', en: 'Treasurer' },
    university: 'James Cook University',
    instagram: '@budisantoso',
  },
  {
    name: 'Lisa Rahmawati',
    role: { id: 'Kepala Acara', en: 'Events Head' },
    university: 'QUT',
    instagram: '@lisarahmawati',
  },
];

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {getTranslation(translations.about.title, language)}
          </h1>
          <p className="text-xl text-blue-100">
            Perhimpunan Pelajar Indonesia di Australia -- Queensland
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {language === 'id' ? 'Tentang PPIA Queensland' : 'About PPIA Queensland'}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              {language === 'id'
                ? 'Perhimpunan Pelajar Indonesia di Australia -- Queensland (PPIA Queensland) adalah organisasi siswa Indonesia yang dinamis dan nirlaba yang dibangun atas semangat kesatuan dan kolaborasi. Kami adalah satu dari delapan cabang resmi PPI Australia, didirikan pada tahun 1988.'
                : 'The Indonesian Student Association in Australia - Queensland Chapter (PPIA Queensland) is a dynamic non-profit organization built on the spirit of unity and collaboration. We are one of eight official branches under PPI Australia, established in 1988.'}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {language === 'id'
                ? 'Misi kami adalah menghubungkan pelajar Indonesia di Queensland dengan peluang dan satu sama lain, sambil mendukung pengembangan profesional, keterampilan akademis, dan pembangunan komunitas.'
                : 'Our mission is to connect Indonesian students across Queensland with opportunities and each other, while supporting professional development, academic skills, and community building.'}
            </p>
          </div>

          {/* University Branches */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg">
              {getTranslation(translations.about.branches.title, language)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {UNIVERSITIES.map((uni, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{uni.name}</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>📧 {uni.email}</p>
                    <p>📱 {uni.instagram}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-lg">
              {getTranslation(translations.about.team.title, language)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM_MEMBERS.map((member, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-1">{getTranslation(member.role, language)}</p>
                  <p className="text-xs text-gray-600 mb-3">{member.university}</p>
                  <a href={`https://instagram.com/${member.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600">
                    {member.instagram}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold text-white mb-4">
              {language === 'id' ? 'Hubungi Kami' : 'Get in Touch'}
            </h3>
            <p className="text-blue-100 mb-4 text-lg">
              {language === 'id'
                ? 'Untuk informasi lebih lanjut, hubungi kami melalui:'
                : 'For more information, contact us via:'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="mailto:info@ppiaq.org" className="text-white hover:text-yellow-300 font-bold text-lg transition">
                📧 info@ppiaq.org
              </a>
              <a href="https://instagram.com/ppiaqueensland" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 font-bold text-lg transition">
                📱 @ppiaqueensland
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
