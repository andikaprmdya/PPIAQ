'use client';

import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function MissionSection() {
  const { language } = useLanguage();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {getTranslation(translations.home.mission.title, language)}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            {getTranslation(translations.home.mission.description, language)}
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: language === 'id' ? 'Komunitas' : 'Community',
                description: language === 'id'
                  ? 'Membangun persahabatan dan jaringan yang bermakna'
                  : 'Building meaningful friendships and networks'
              },
              {
                title: language === 'id' ? 'Peluang' : 'Opportunities',
                description: language === 'id'
                  ? 'Membuka pintu untuk pertumbuhan akademis dan profesional'
                  : 'Opening doors for academic and professional growth'
              },
              {
                title: language === 'id' ? 'Budaya' : 'Culture',
                description: language === 'id'
                  ? 'Melestarikan dan merayakan warisan Indonesia'
                  : 'Preserving and celebrating Indonesian heritage'
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-2xl text-white font-bold">✓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700 text-sm font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
