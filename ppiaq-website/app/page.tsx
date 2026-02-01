'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useFormSubmit } from '@/lib/hooks/useFormSubmit';
import { API_ENDPOINTS } from '@/lib/constants';

export default function HomePage() {
  const { language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const { submit: submitNewsletter, loading: newsletterLoading, success: newsletterSuccess, error: newsletterError } = useFormSubmit();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitNewsletter({
      endpoint: API_ENDPOINTS.NEWSLETTER_SUBSCRIBE,
      data: { email: newsletterEmail },
      onSuccess: () => setNewsletterEmail(''),
    });
  };

  const faqData = language === 'id' ? [
    { q: 'Apa saja manfaat menjadi anggota?', a: 'Anggota PPIAQ mendapatkan akses eksklusif ke acara khusus, diskon dari mitra, akses awal ke kalender program, dan akses penuh ke papan komunitas.' },
    { q: 'Bisakah saya menjadi anggota?', a: 'Ya! Jika Anda mahasiswa Indonesia di Queensland atau tertarik mendukung komunitas, Anda bisa mendaftar sebagai Ordinary Member atau Associate Member.' },
    { q: 'Mengapa saya harus menyelesaikan formulir database?', a: 'Formulir database membantu kami tetap terhubung dengan semua pelajar Indonesia dan memberikan informasi penting tentang peluang, acara, dan dukungan komunitas.' },
  ] : [
    { q: 'What are the benefits of becoming a member?', a: 'PPIAQ members receive exclusive pricing to special events, early access to our program calendar, full access to our community board, and special partner discounts.' },
    { q: 'Can I become a member?', a: 'Yes! If you\'re an Indonesian student in Queensland or interested in supporting our community, you can register as an Ordinary Member or Associate Member.' },
    { q: 'Why should I complete the database form?', a: 'The database form helps us stay connected with all Indonesian students and allows us to share important information about opportunities, events, and community support.' },
  ];

  return (
    <main className="font-montserrat text-[#303030] bg-[#FFFAF5] overflow-x-hidden">
      
      {/* --- SECTION 1: HERO (Berdasarkan image_9e5455.jpg) --- */}
      <section className="text-white py-20 px-6 min-h-[70vh] flex items-center relative overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/QUEENSLAND, AUSTRALIA - DJI Cinematic Video - Justin Bainbridge (1080p, h264).mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          {/* Cendrawasih Image */}
          <Image
            src="/images/Cendrawasih_Up.png"
            alt="Cendrawasih Bird Decoration"
            width={300}
            height={400}
            priority
            className="shrink-0"
          />

          <div className="text-center md:text-left">
            <h1 className="font-tan-angleton font-bold text-5xl md:text-7xl mb-6 text-[#FEB602]">
              Welcome to PPIA Queensland!
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-90 leading-relaxed italic">
              {language === 'id' 
                ? 'Selamat datang! Kami menghubungkan pelajar Indonesia di seluruh Queensland dengan berbagai peluang, dan satu sama lain.'
                : 'Selamat datang! We connect Indonesian students all over Queensland to opportunities, and to each other.'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="px-8 py-3 bg-white text-[#B64847] font-bold rounded-sm hover:bg-[#FEB602] transition-colors uppercase tracking-wider text-sm">
                {language === 'id' ? 'Pelajari Tentang Kami' : 'Learn More About Us'}
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-sm hover:bg-white hover:text-[#B64847] transition-all uppercase tracking-wider text-sm">
                {language === 'id' ? 'Jadilah Anggota' : 'Become a Member'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: INTRO & ACTION (Berdasarkan image_9df675.png) --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Logo PPIAQ */}
          <Image
            src="/images/PPIAQ_logo.png"
            alt="PPIA Queensland Logo"
            width={96}
            height={96}
            className="mx-auto mb-8"
          />
          
          <h2 className="font-tan-angleton font-bold text-3xl md:text-5xl text-[#B64847] mb-8">
            {language === 'id' ? 'Kami ada untuk pelajar Indonesia di Queensland' : "We're here for Indonesian students in Queensland"}
          </h2>
          
          <p className="text-gray-600 text-lg mb-12 italic leading-relaxed max-w-3xl mx-auto">
            {language === 'id'
              ? 'Baik ini pertama kalinya Anda jauh dari rumah, atau Anda adalah mahasiswa internasional kawakan, kami di sini untuk menjadi komunitas Anda. Sekarang, bagaimana kami bisa membantu Anda hari ini?'
              : 'Whether this is your first time away from home, or you\'re a seasoned international student, we\'re here for you to be your community. Now, how can we help you today?'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 bg-black text-white font-bold hover:bg-[#B64847] transition-colors uppercase tracking-widest text-sm">
              {language === 'id' ? 'Panduan Queensland' : 'Guide to Queensland Booklet'}
            </button>
            <button className="p-6 bg-black text-white font-bold hover:bg-[#B64847] transition-colors uppercase tracking-widest text-sm">
              {language === 'id' ? 'Tambahkan Saya ke Database' : 'Add Me to the Database'}
            </button>
            <button className="p-6 bg-black text-white font-bold hover:bg-[#B64847] transition-colors uppercase tracking-widest text-sm">
              {language === 'id' ? 'Saya Ingin Menjadi Anggota' : 'I Want to Become a Member'}
            </button>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: UPCOMING EVENTS (Berdasarkan image_9df63a.jpg) --- */}
      <section className="py-24 px-6 bg-[#E4DBCA]/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847] text-center mb-16">
            {language === 'id' ? 'Acara Mendatang' : 'Upcoming events'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { day: '5', month: 'FEB', title: 'Pre-Departure Briefing - Semester 1, 2026', date: 'Thursday, February 5, 2026', loc: 'Zoom', image: '/images/predeparture.jpg' },
              { day: '16', month: 'FEB', title: 'QUT Market Day - Join ISAQ / PPIA QUT', date: 'Monday, February 16, 2026', loc: 'QUT', image: '/images/qutmarketday.jpg' },
              { day: '18', month: 'FEB', title: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ', date: 'Wednesday, February 18, 2026', loc: 'UQ St. Lucia', image: '/images/uqmarketday.jpg' },
            ].map((event, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#E4DBCA] group hover:-translate-y-1.25">
                <div className="h-48 bg-gray-200 relative flex items-center justify-center text-gray-400 italic overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={300}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-4 left-4 bg-[#B64847] text-white p-2 min-w-12 text-center rounded-md">
                    <p className="text-xl font-bold leading-none">{event.day}</p>
                    <p className="text-xs">{event.month}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-4 group-hover:text-[#B64847] transition-colors">{event.title}</h3>
                  <div className="space-y-1 text-sm text-gray-500 font-medium">
                    <p>📅 {event.date}</p>
                    <p>📍 {event.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 4: FAQ (Berdasarkan image_9df619.png) --- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847] mb-12">
            {language === 'id' ? 'Pertanyaan yang Sering Diajukan' : 'Frequently asked questions'}
          </h2>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="bg-[#FEB602]/20 rounded-lg overflow-hidden transition-all">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                  className="w-full p-6 flex justify-between items-center cursor-pointer group hover:bg-[#FEB602]/30 transition-all"
                >
                  <span className="font-bold text-sm tracking-widest uppercase opacity-70 group-hover:opacity-100 text-left">{faq.q}</span>
                  <span className={`text-2xl font-light text-[#B64847] transition-transform duration-300 ${expandedFAQ === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {expandedFAQ === i && (
                  <div className="px-6 pb-6 bg-[#FEB602]/10 border-t border-[#FEB602]/30">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 5: STAY IN TOUCH & CONTACT (Berdasarkan image_9df5fb.png) --- */}
      <section className="py-24 px-6 bg-[#FFFAF5]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20">
          
          {/* Newsletter Form */}
          <div className="flex-1">
            <h3 className="font-tan-angleton font-bold text-5xl text-[#B64847] mb-8">
              {language === 'id' ? 'Tetap Terhubung' : 'Stay in touch'}
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 italic">* {language === 'id' ? 'Menunjukkan field yang diperlukan' : 'Indicates required field'}</p>
            <form className="space-y-6" onSubmit={handleNewsletterSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email <span className="text-[#B64847]">*</span></label>
                <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required className="w-full p-3 border border-gray-300 focus:border-[#B64847] outline-none transition-all rounded-sm" />
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 accent-[#B64847]" id="marketing" required />
                <label htmlFor="marketing" className="text-xs font-medium leading-relaxed text-gray-600">
                  {language === 'id'
                    ? 'Saya setuju menerima materi pemasaran dan promosi'
                    : 'I agree to receiving marketing and promotional materials'} <span className="text-[#B64847]">*</span>
                </label>
              </div>
              {newsletterSuccess && <p className="text-green-600 text-xs font-bold">✓ {language === 'id' ? 'Berhasil berlangganan!' : 'Successfully subscribed!'}</p>}
              {newsletterError && <p className="text-red-600 text-xs font-bold">✗ {newsletterError}</p>}
              <button type="submit" disabled={newsletterLoading} className="px-10 py-4 border border-black text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all disabled:opacity-50">
                {newsletterLoading ? (language === 'id' ? 'Mengirim...' : 'Sending...') : (language === 'id' ? 'Berlangganan Newsletter' : 'Subscribe to Newsletter')}
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="flex-1">
            <h3 className="font-tan-angleton font-bold text-5xl text-[#B64847] mb-8">
              {language === 'id' ? 'Hubungi Kami' : 'Contact us'}
            </h3>
            <div className="space-y-6 text-lg text-gray-700">
              <p className="font-medium leading-relaxed">
                Perhimpunan Pelajar Indonesia di Australia, Queensland
              </p>
              <p className="font-bold">
                Email: <a href="mailto:qld@ppi-australia.org" className="text-[#B64847] hover:underline">qld@ppi-australia.org</a>
              </p>
              <div className="pt-4">
                <a href="https://instagram.com/ppiaqueensland" target="_blank" className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg text-2xl hover:bg-[#B64847] hover:border-[#B64847] hover:text-white transition-all">
                  📸
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}