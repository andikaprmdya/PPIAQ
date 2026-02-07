'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function PreDepartureBriefingPage() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleExpressionOfInterest = () => {
    setIsLoading(true);
    const subject = encodeURIComponent('Expression of Interest - Pre-Departure Briefing');
    const body = encodeURIComponent(
      `Dear PPIAQ Team,\n\nI am interested in attending the Pre-Departure Briefing - Semester 1, 2026.\n\nPlease find my details below:\n\nName: [Your Name]\nEmail: [Your Email]\nStudent ID: [Your Student ID]\nUniversity: [Your University]\n\nThank you!\n\nBest regards`
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
            {language === 'id' ? 'Pre-Departure Briefing' : 'Pre-Departure Briefing'}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {language === 'id'
              ? 'Persiapkan diri Anda untuk semester pertama dengan informasi dan tips berharga'
              : 'Prepare yourself for the first semester with valuable information and tips'}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span>Thursday, February 5, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <span>Zoom</span>
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
                  ? 'Pre-Departure Briefing adalah sesi persiapan penting bagi semua pelajar Indonesia yang akan memulai perjalanan mereka ke Queensland. Dalam sesi ini, kami akan membagikan informasi praktis, tips survival, dan kesempatan untuk bertanya langsung kepada alumni dan tim PPIAQ.'
                  : 'The Pre-Departure Briefing is an essential preparation session for all Indonesian students beginning their journey to Queensland. In this session, we will share practical information, survival tips, and an opportunity to ask questions directly to alumni and the PPIAQ team.'}
              </p>
            </div>
          </div>

          {/* Topics Covered */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Topik yang Dibahas' : 'Topics Covered'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🏫',
                  title: language === 'id' ? 'Adaptasi Akademik' : 'Academic Adaptation',
                  desc: language === 'id'
                    ? 'Tips sukses di universitas Australia dan perbedaan sistem pendidikan'
                    : 'Tips for success at Australian universities and education system differences'
                },
                {
                  icon: '🏠',
                  title: language === 'id' ? 'Akomodasi & Gaya Hidup' : 'Accommodation & Lifestyle',
                  desc: language === 'id'
                    ? 'Menemukan tempat tinggal, biaya hidup, dan tips hidup mandiri'
                    : 'Finding accommodation, living costs, and tips for independent living'
                },
                {
                  icon: '🤝',
                  title: language === 'id' ? 'Komunitas & Networking' : 'Community & Networking',
                  desc: language === 'id'
                    ? 'Bagaimana PPIAQ dapat membantu dan cara bergabung dengan komunitas'
                    : 'How PPIAQ can help and ways to join our community'
                },
                {
                  icon: '📋',
                  title: language === 'id' ? 'Dokumentasi & Visa' : 'Documentation & Visa',
                  desc: language === 'id'
                    ? 'Persyaratan penting dan dokumen yang diperlukan untuk tinggal di Australia'
                    : 'Important requirements and documents needed for staying in Australia'
                },
              ].map((topic, idx) => (
                <div
                  key={idx}
                  className="bg-[#FEB602]/10 p-6 rounded-xl border border-[#FEB602] hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">{topic.icon}</div>
                  <h3 className="font-bold text-lg text-[#B64847] mb-2">{topic.title}</h3>
                  <p className="text-gray-600">{topic.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Speaker Info */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Pembicara' : 'Speakers'}
            </h2>
            <div className="bg-gradient-to-r from-[#B64847]/10 to-[#FEB602]/10 p-8 rounded-2xl border border-[#E4DBCA]">
              <p className="text-lg text-gray-700 leading-relaxed">
                {language === 'id'
                  ? 'Sesi ini akan dipandu oleh tim PPIAQ berpengalaman dan alumni yang telah sukses menjalani transisi mereka ke Queensland. Mereka siap berbagi pengalaman pribadi dan menjawab semua pertanyaan Anda.'
                  : 'This session will be led by the experienced PPIAQ team and alumni who have successfully made their transition to Queensland. They are ready to share personal experiences and answer all your questions.'}
              </p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-6">
              {language === 'id' ? 'Catatan Penting' : 'Important Notes'}
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <span className="text-2xl">✓</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Acara berlangsung via Zoom - link akan dikirim sebelum event'
                    : 'Event is held via Zoom - link will be sent before the event'}
                </p>
              </div>
              <div className="flex gap-4 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <span className="text-2xl">✓</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Sesi ini gratis untuk semua anggota PPIAQ dan calon anggota'
                    : 'This session is free for all PPIAQ members and prospective members'}
                </p>
              </div>
              <div className="flex gap-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <span className="text-2xl">✓</span>
                <p className="text-gray-700">
                  {language === 'id'
                    ? 'Hadir tepat waktu - sesi akan dimulai tepat pukul 7 malam AWST'
                    : 'Arrive on time - session will start promptly at 7 PM AWST'}
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
