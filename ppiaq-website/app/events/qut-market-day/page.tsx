'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function QUTMarketDayPage() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleExpressionOfInterest = () => {
    setIsLoading(true);
    const subject = encodeURIComponent('Expression of Interest - QUT Market Day');
    const body = encodeURIComponent(
      `Dear PPIAQ Team,\\n\\nI am interested in attending the QUT Market Day - February 16, 2026.\\n\\nPlease find my details below:\\n\\nName: [Your Name]\\nEmail: [Your Email]\\nStudent ID: [Your Student ID]\\nUniversity: [Your University]\\n\\nThank you!\\n\\nBest regards`
    );
    window.location.href = `mailto:qld@ppi-australia.org?subject=${subject}&body=${body}`;
    setIsLoading(false);
  };

  return (
    <main className="font-montserrat text-[#303030] bg-[#FFFAF5] min-h-screen">
      {/* Back Button */}
      <div className="p-6">
        <Link href="/" className="text-[#B64847] hover:text-[#9a3a3e] font-bold inline-flex items-center gap-2">
          ← {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#B64847] to-[#9a3a3e] text-white">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-tan-angleton font-bold text-5xl md:text-6xl mb-6">
            {language === 'id' ? 'QUT Market Day' : 'QUT Market Day'}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {language === 'id'
              ? 'Temui organisasi mahasiswa, sponsor, dan peluang karir di hari pasar QUT'
              : 'Meet student organizations, sponsors, and career opportunities at QUT\'s market day'}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span>Monday, February 16, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span>QUT Campus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Overview */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Tentang Acara Ini' : 'About This Event'}
            </h2>
            <div className="bg-white p-8 rounded-2xl border border-[#E4DBCA] shadow-md">
              <p className="text-lg leading-relaxed text-gray-700 mb-4">
                {language === 'id'
                  ? 'Market Day QUT adalah kesempatan sempurna untuk bertemu dengan berbagai organisasi mahasiswa, departemen universitas, dan sponsor yang tertarik dengan mahasiswa internasional. Acara ini adalah platform ideal untuk networking, menemukan organisasi yang sesuai dengan minat Anda, dan mengeksplorasi peluang karir.'
                  : 'QUT Market Day is the perfect opportunity to meet various student organizations, university departments, and sponsors interested in international students. This event is an ideal platform for networking, finding organizations that match your interests, and exploring career opportunities.'}
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Apa yang Akan Anda Temukan' : 'What to Expect'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🎓',
                  title: language === 'id' ? 'Organisasi Mahasiswa' : 'Student Organizations',
                  desc: language === 'id'
                    ? 'Bertemu dengan berbagai klub dan organisasi mahasiswa di QUT'
                    : 'Meet with various clubs and student organizations at QUT'
                },
                {
                  icon: '💼',
                  title: language === 'id' ? 'Peluang Karir' : 'Career Opportunities',
                  desc: language === 'id'
                    ? 'Jelajahi peluang internship, graduate programs, dan job placement'
                    : 'Explore internship, graduate programs, and job placement opportunities'
                },
                {
                  icon: '🤝',
                  title: language === 'id' ? 'Networking' : 'Networking',
                  desc: language === 'id'
                    ? 'Terhubung dengan teman sebaya, mentor, dan professional di industri'
                    : 'Connect with peers, mentors, and industry professionals'
                },
                {
                  icon: '🎁',
                  title: language === 'id' ? 'Hadiah & Giveaways' : 'Prizes & Giveaways',
                  desc: language === 'id'
                    ? 'Kesempatan untuk memenangkan hadiah menarik dari sponsor'
                    : 'Chance to win exciting prizes from sponsors'
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#FEB602]/10 p-6 rounded-xl border border-[#FEB602] hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-lg text-[#B64847] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PPIA Presence */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'PPIA di Market Day' : 'PPIA at Market Day'}
            </h2>
            <div className="bg-gradient-to-r from-[#B64847]/10 to-[#FEB602]/10 p-8 rounded-2xl border border-[#E4DBCA]">
              <p className="text-lg text-gray-700 leading-relaxed">
                {language === 'id'
                  ? 'PPIAQ akan hadir untuk mewakili komunitas mahasiswa Indonesia dan memberikan informasi tentang organisasi kami. Kami akan berbagi tentang program mentoring, networking events, dan dukungan yang kami sediakan untuk mahasiswa Indonesia di QUT dan sekitarnya. Kunjungi booth PPIA/ISAQ untuk belajar lebih lanjut tentang bagaimana kami bisa membantu Anda!'
                  : 'PPIAQ will be present to represent the Indonesian student community and provide information about our organization. We will share about our mentoring programs, networking events, and support services for Indonesian students at QUT and beyond. Visit the PPIA/ISAQ booth to learn more about how we can help you!'}
              </p>
            </div>
          </div>

          {/* Tips for Market Day */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Tips untuk Market Day' : 'Tips for Market Day'}
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Bawa beberapa salinan CV Anda dan bersiaplah untuk berbicara singkat tentang minat dan tujuan Anda'
                    : 'Bring several copies of your CV and be prepared to speak briefly about your interests and goals'}
                </p>
              </div>
              <div className="flex gap-4 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Jangan ragu untuk bertanya - ini adalah kesempatan untuk belajar dan membuat koneksi'
                    : 'Don\'t hesitate to ask questions - this is an opportunity to learn and make connections'}
                </p>
              </div>
              <div className="flex gap-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Datang lebih awal untuk menghindari keramaian dan mendapatkan perhatian penuh dari perwakilan booth'
                    : 'Come early to avoid crowds and get full attention from booth representatives'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={handleExpressionOfInterest}
              disabled={isLoading}
              className="px-8 py-4 bg-[#B64847] text-white font-bold rounded-lg hover:bg-[#9a3a3e] transition-all transform hover:scale-105 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {isLoading
                ? language === 'id'
                  ? 'Sedang membuka email...'
                  : 'Opening email...'
                : language === 'id'
                ? 'Kirim Expression of Interest'
                : 'Send Expression of Interest'}
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
