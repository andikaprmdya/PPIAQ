'use client';

import { useLanguage } from '@/lib/language-context';

export default function FeaturesSection() {
  const { language } = useLanguage();

  const features = [
    {
      icon: '🎓',
      title: language === 'id' ? 'Dukungan Akademik' : 'Academic Support',
      description: language === 'id'
        ? 'Dapatkan bantuan dan bimbingan dari mahasiswa berpengalaman'
        : 'Get help and guidance from experienced students'
    },
    {
      icon: '🤝',
      title: language === 'id' ? 'Networking' : 'Networking',
      description: language === 'id'
        ? 'Terhubung dengan pelajar Indonesia di seluruh Queensland'
        : 'Connect with Indonesian students across Queensland'
    },
    {
      icon: '🎉',
      title: language === 'id' ? 'Acara Budaya' : 'Cultural Events',
      description: language === 'id'
        ? 'Rayakan warisan Indonesia melalui berbagai acara'
        : 'Celebrate Indonesian heritage through various events'
    },
    {
      icon: '💼',
      title: language === 'id' ? 'Peluang Karir' : 'Career Opportunities',
      description: language === 'id'
        ? 'Akses magang dan peluang pekerjaan eksklusif'
        : 'Access internships and exclusive job opportunities'
    },
    {
      icon: '📚',
      title: language === 'id' ? 'Sumber Daya' : 'Resources',
      description: language === 'id'
        ? 'Akses panduan, tips, dan informasi berguna'
        : 'Access guides, tips, and useful information'
    },
    {
      icon: '🌐',
      title: language === 'id' ? 'Komunitas Global' : 'Global Community',
      description: language === 'id'
        ? 'Bagian dari jaringan PPI di seluruh Australia'
        : 'Part of PPI network across Australia'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-lg inline-block px-12">
            {language === 'id' ? 'Mengapa Bergabung?' : 'Why Join Us?'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
