'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

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

  const faqs = [
    {
      q: language === 'id' ? 'Berapa lama keanggotaan saya berlaku?' : 'How long is my membership valid?',
      a: language === 'id' ? 'Keanggotaan berlaku selama satu tahun akademik (12 bulan) sejak tanggal pendaftaran Anda.' : 'Membership is valid for one academic year (12 months) from your registration date.'
    },
    {
      q: language === 'id' ? 'Apakah saya akan mendapatkan kartu anggota fisik?' : 'Will I get a physical membership card?',
      a: language === 'id' ? 'Saat ini kami menyediakan kartu anggota digital yang bisa Anda akses melalui profil akun Anda setelah login.' : 'Currently, we provide a digital membership card that you can access through your account profile after logging in.'
    },
    {
      q: language === 'id' ? 'Bagaimana cara memperbarui keanggotaan saya?' : 'How do I renew my membership?',
      a: language === 'id' ? 'Anda akan menerima notifikasi email sebulan sebelum masa berlaku habis untuk melakukan pembaruan melalui dashboard anggota.' : 'You will receive an email notification a month before expiry to renew through the member dashboard.'
    },
    {
      q: language === 'id' ? 'Saya lupa password akun saya, apa yang harus dilakukan?' : 'I forgot my password, what should I do?',
      a: language === 'id' ? 'Gunakan fitur "Forgot Password" di halaman login untuk mengatur ulang kata sandi melalui email Anda.' : 'Use the "Forgot Password" feature on the login page to reset your password via email.'
    }
  ];

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen">
      
      {/* --- HERO SECTION (SLIMMER & SMALLER FONT) --- */}
      <section className="bg-[#B64847] text-white pt-16 pb-12 px-6 flex flex-col justify-center relative overflow-hidden min-h-[45vh]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEB602] opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10 w-full">
          {/* Main Title (Smaller & Slimmer) */}
          <h1 className="font-tan-angleton font-bold text-3xl md:text-5xl text-[#FEB602] mb-6 tracking-wide">
            {language === 'id' ? "Gabung Keanggotaan Kami" : "Join Our Membership"}
          </h1>
          
          <div className="space-y-6">
            {/* Welcome Greeting (Smaller & Centered) */}
            <h2 className="font-tan-angleton font-bold text-xl md:text-3xl text-white">
              {language === 'id' ? "Selamat Datang, Kami sangat senang Anda ada di sini." : "Welcome, We are so glad you are here."}
            </h2>
            
            {/* Centered Description (Refined font size) */}
            <p className="text-sm md:text-lg leading-relaxed opacity-90 italic max-w-3xl mx-auto">
              {language === 'id' ? (
                "Anggota PPIAQ menerima harga eksklusif untuk acara berbayar, akses awal ke kalender program, dan akses penuh ke papan komunitas. Dapatkan juga newsletter khusus serta diskon spesial dari mitra kami."
              ) : (
                "PPIAQ members receive exclusive prices to our ticketed events, early access to our program calendar, and all-access to our community board. Plus, you will receive a special members-only newsletter on top of special discounts."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* --- IMPORTANT NOTICE --- */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-[#E4DBCA] rounded-4xl p-8 shadow-sm">
          <h3 className="font-tan-angleton font-bold text-xl text-[#B64847] mb-3">
            {language === 'id' ? 'Penting bagi Mahasiswa Universitas' : 'Important for University Students'}
          </h3>
          <p className="text-[#303030] leading-relaxed text-base opacity-80">
            {language === 'id' ? (
              "Jika Anda mahasiswa di UQ, QUT, Griffith, atau JCU, hubungi asosiasi universitas Anda untuk pendaftaran. Anda otomatis menjadi anggota PPIAQ dan menikmati fasilitas yang sama."
            ) : (
              "If you are a student at UQ, QUT, Griffith University or JCU, please approach the Indonesian association at your university. You will receive automatic membership to PPIAQ."
            )}
          </p>
        </div>
      </section>

      {/* --- MEMBERSHIP PLANS --- */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Ordinary Member Card */}
            <div className="group">
              <div className="bg-white rounded-4xl border border-[#E4DBCA] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.25 transition-all duration-500">
                <div className="bg-[#B64847] p-8 text-white text-center">
                  <h2 className="font-tan-angleton font-bold text-2xl mb-2">Ordinary Member</h2>
                  <div className="flex items-center justify-center gap-1 font-tan-angleton">
                    <span className="text-3xl font-bold">$10</span>
                    <span className="text-lg font-bold tracking-tighter">AUD</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-3 mb-8">
                    {benefits.map((benefit) => (
                      <div key={benefit.id} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-[#FEB602]/20 text-[#B64847] rounded-full text-[10px] font-bold">✓</span>
                        <span className="text-sm text-gray-700 font-medium">{benefit.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/auth/register" className="block w-full text-center bg-[#B64847] text-white py-3 rounded-xl hover:bg-[#303030] transition-colors font-bold uppercase tracking-widest text-xs">
                    Sign Up Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Associate Member Card */}
            <div className="group">
              <div className="bg-white rounded-4xl border border-[#E4DBCA] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.25 transition-all duration-500">
                <div className="bg-[#FEB602] p-8 text-[#303030] text-center">
                  <h2 className="font-tan-angleton font-bold text-2xl mb-2">Associate Member</h2>
                  <div className="flex items-center justify-center gap-1 font-tan-angleton">
                    <span className="text-3xl font-bold">$10</span>
                    <span className="text-lg font-bold tracking-tighter">AUD</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-3 mb-8">
                    {benefits.map((benefit) => (
                      <div key={benefit.id} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-[#B64847]/10 text-[#B64847] rounded-full text-[10px] font-bold">✓</span>
                        <span className="text-sm text-gray-700 font-medium">{benefit.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/auth/register" className="block w-full text-center border-2 border-[#303030] text-[#303030] py-3 rounded-xl hover:bg-[#303030] hover:text-white transition-all font-bold uppercase tracking-widest text-xs">
                    Sign Up Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* --- WHAT YOU GET TABLE --- */}
          <div className="bg-white rounded-4xl border border-[#E4DBCA] p-6 md:p-10 shadow-sm mb-20">
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] text-center mb-8">What You Get</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E4DBCA]">
                    <th className="text-left py-4 px-4 text-[#886644] font-bold uppercase tracking-widest text-[10px]">Benefit</th>
                    <th className="text-center py-4 px-4 text-[#B64847] font-bold uppercase tracking-widest text-[10px]">Ordinary</th>
                    <th className="text-center py-4 px-4 text-[#B64847] font-bold uppercase tracking-widest text-[10px]">Associate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DBCA]/20">
                  {[{ n: 'Event Pricing', v: '✓' }, { n: 'Early Access', v: '✓' }, { n: 'Community Board', v: '✓' }, { n: 'Newsletter', v: '✓' }, { n: 'Partner Discounts', v: '✓' }].map((r, i) => (
                    <tr key={i} className="group hover:bg-[#FFFAF5] transition-colors italic">
                      <td className="py-4 px-4 text-xs font-medium text-gray-600">{r.n}</td>
                      <td className="py-4 px-4 text-center text-[#B64847] font-bold text-lg">{r.v}</td>
                      <td className="py-4 px-4 text-center text-[#B64847] font-bold text-lg">{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- FAQ SECTION (5 Questions) --- */}
          <div className="max-w-4xl mx-auto pb-20">
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] text-center mb-10 italic">Membership FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-[#E4DBCA] rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-base font-bold text-[#B64847] mb-2 flex items-center gap-3">
                    <span className="text-[#FEB602]">Q:</span> {faq.q}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed pl-7">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
