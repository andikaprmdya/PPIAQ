'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function UQMarketDayPage() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleExpressionOfInterest = () => {
    setIsLoading(true);
    const subject = encodeURIComponent('Expression of Interest - UQ St. Lucia Market Day');
    const body = encodeURIComponent(
      `Dear PPIAQ Team,\\n\\nI am interested in attending the UQ St. Lucia Market Day - February 18, 2026.\\n\\nPlease find my details below:\\n\\nName: [Your Name]\\nEmail: [Your Email]\\nStudent ID: [Your Student ID]\\nUniversity: [Your University]\\n\\nThank you!\\n\\nBest regards`
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
            {language === 'id' ? 'UQ Market Day' : 'UQ Market Day'}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {language === 'id'
              ? 'Jelajahi peluang akademik, karir, dan organisasi mahasiswa di Universitas Queensland'
              : 'Explore academic opportunities, careers, and student organizations at the University of Queensland'}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span>Wednesday, February 18, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span>UQ St. Lucia Campus</span>
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
                  ? 'Market Day UQ St. Lucia adalah acara tahunan yang menampilkan berbagai program akademik, layanan mahasiswa, organisasi, dan peluang pengembangan diri. Ini adalah kesempatan sempurna untuk menjelajahi kehidupan kampus, bertemu dengan anggota fakultas, dan menemukan komunitas yang sesuai dengan Anda di universitas terbesar di Queensland.'
                  : 'UQ St. Lucia Market Day is an annual event showcasing various academic programs, student services, organizations, and personal development opportunities. It\'s the perfect chance to explore campus life, meet faculty members, and find communities that match your interests at Queensland\'s largest university.'}
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
                  icon: '🏛️',
                  title: language === 'id' ? 'Fakultas & Program Akademik' : 'Faculties & Academic Programs',
                  desc: language === 'id'
                    ? 'Pelajari tentang berbagai program studi dan fakultas di UQ'
                    : 'Learn about various degree programs and faculties at UQ'
                },
                {
                  icon: '🌟',
                  title: language === 'id' ? 'Layanan Mahasiswa' : 'Student Services',
                  desc: language === 'id'
                    ? 'Temukan dukungan akademik, kesehatan, kesejahteraan, dan layanan karir'
                    : 'Find academic support, health, wellness, and career services'
                },
                {
                  icon: '👥',
                  title: language === 'id' ? 'Klub & Masyarakat' : 'Clubs & Societies',
                  desc: language === 'id'
                    ? 'Bergabunglah dengan ribuan organisasi mahasiswa sesuai minat Anda'
                    : 'Join thousands of student-led clubs and societies matching your interests'
                },
                {
                  icon: '🚀',
                  title: language === 'id' ? 'Program Pengembangan' : 'Development Programs',
                  desc: language === 'id'
                    ? 'Jelajahi leadership, mentoring, dan peluang pertumbuhan profesional'
                    : 'Explore leadership, mentoring, and professional growth opportunities'
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
                  ? 'PPIAQ dan UQISA (Indonesian Student Association at UQ) akan hadir untuk menyambut semua mahasiswa Indonesia baru dan lama. Kami menyediakan informasi tentang komunitas, acara networking, program mentoring, dan dukungan akademik & sosial. Kunjungi booth kami untuk bertemu dengan pengurus, dapatkan tips survival di UQ, dan bergabunglah dengan komunitas mahasiswa Indonesia terbesar di Queensland!'
                  : 'PPIAQ and UQISA (Indonesian Student Association at UQ) will be present to welcome all new and returning Indonesian students. We provide information about our community, networking events, mentoring programs, and academic & social support. Visit our booth to meet the board members, get survival tips for UQ, and join Queensland\'s largest Indonesian student community!'}
              </p>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Tips Pro untuk Market Day' : 'Pro Tips for Market Day'}
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <span className="text-2xl">⭐</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Datang dengan pertanyaan spesifik tentang program yang Anda minati - perwakil akan senang membantu'
                    : 'Come with specific questions about programs you\'re interested in - representatives will be happy to help'}
                </p>
              </div>
              <div className="flex gap-4 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <span className="text-2xl">⭐</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Kumpulkan contact information dan follow-up dengan organisasi yang Anda minati setelah event'
                    : 'Collect contact information and follow up with organizations you\'re interested in after the event'}
                </p>
              </div>
              <div className="flex gap-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <span className="text-2xl">⭐</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Jangan lewatkan PPIA booth - kami punya informasi valuable tentang kehidupan di UQ dan Queensland'
                    : 'Don\'t miss the PPIA booth - we have valuable information about life at UQ and Queensland'}
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
