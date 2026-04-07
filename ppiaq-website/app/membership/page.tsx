'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export default function MembershipPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedMembershipType, setSelectedMembershipType] = useState<'ordinary' | 'associate' | ''>('');
  const [agreeAssociateLimits, setAgreeAssociateLimits] = useState(false);
  const [agreePrivacyUse, setAgreePrivacyUse] = useState(false);

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

  const openSignupModal = () => {
    setSelectedMembershipType('');
    setAgreeAssociateLimits(false);
    setAgreePrivacyUse(false);
    setShowSignupModal(true);
  };

  const continueToRegister = () => {
    if (!selectedMembershipType) return;
    const requiresAssociateAgreement = selectedMembershipType === 'associate';
    if ((requiresAssociateAgreement && !agreeAssociateLimits) || !agreePrivacyUse) return;
    router.push(`/auth/register?membershipType=${selectedMembershipType}`);
  };

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
          <div className="max-w-2xl mx-auto mb-20">
            <div className="group">
              <div className="bg-white rounded-4xl border border-[#E4DBCA] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.25 transition-all duration-500">
                <div className="bg-[#B64847] p-8 text-white text-center">
                  <h2 className="font-tan-angleton font-bold text-2xl mb-2">{language === 'id' ? 'Anggota' : 'Member'}</h2>
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
                  <button
                    type="button"
                    onClick={openSignupModal}
                    className="block w-full text-center bg-[#B64847] text-white py-3 rounded-xl hover:bg-[#303030] transition-colors font-bold uppercase tracking-widest text-xs"
                  >
                    {language === 'id' ? 'Daftar Sekarang' : 'Sign Up Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- WHAT YOU GET TABLE --- */}
          <div className="bg-white rounded-4xl border border-[#E4DBCA] p-6 md:p-10 shadow-sm mb-20">
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] text-center mb-8">
              {language === 'id' ? 'Manfaat Keanggotaan' : 'What You Get'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E4DBCA]">
                    <th className="text-left py-4 px-4 text-[#886644] font-bold uppercase tracking-widest text-[10px]">
                      {language === 'id' ? 'Manfaat' : 'Benefit'}
                    </th>
                    <th className="text-center py-4 px-4 text-[#B64847] font-bold uppercase tracking-widest text-[10px]">
                      {language === 'id' ? 'Anggota' : 'Member'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DBCA]/20">
                  {[
                    { n: language === 'id' ? 'Harga Acara' : 'Event Pricing', v: '✓' },
                    { n: language === 'id' ? 'Akses Awal' : 'Early Access', v: '✓' },
                    { n: language === 'id' ? 'Papan Komunitas' : 'Community Board', v: '✓' },
                    { n: 'Newsletter', v: '✓' },
                    { n: language === 'id' ? 'Diskon Mitra' : 'Partner Discounts', v: '✓' },
                  ].map((r, i) => (
                    <tr key={i} className="group hover:bg-[#FFFAF5] transition-colors italic">
                      <td className="py-4 px-4 text-xs font-medium text-gray-600">{r.n}</td>
                      <td className="py-4 px-4 text-center text-[#B64847] font-bold text-lg">{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- FAQ SECTION (5 Questions) --- */}
          <div className="max-w-4xl mx-auto pb-20">
            <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] text-center mb-10 italic">
              {language === 'id' ? 'FAQ Keanggotaan' : 'Membership FAQ'}
            </h2>
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

      {showSignupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 px-6 py-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E4DBCA] shadow-2xl p-8">
            <div className="mb-6">
              <h3 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
                {language === 'id' ? 'Pilih Jenis Keanggotaan' : 'Choose Membership Type'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'id'
                  ? 'Pilih kategori keanggotaan Anda sebelum melanjutkan pendaftaran.'
                  : 'Choose your membership category before continuing to registration.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setSelectedMembershipType('ordinary')}
                className={`text-left p-5 rounded-2xl border transition-all ${
                  selectedMembershipType === 'ordinary'
                    ? 'border-[#B64847] bg-[#B64847]/5'
                    : 'border-[#E4DBCA] hover:border-[#B64847]/60'
                }`}
              >
                <p className="font-bold text-[#B64847] mb-1">{language === 'id' ? 'Anggota Biasa' : 'Ordinary Member'}</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'id'
                    ? 'Untuk mahasiswa Indonesia yang memenuhi syarat keanggotaan penuh.'
                    : 'For Indonesian students who meet full membership eligibility.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMembershipType('associate')}
                className={`text-left p-5 rounded-2xl border transition-all ${
                  selectedMembershipType === 'associate'
                    ? 'border-[#B64847] bg-[#B64847]/5'
                    : 'border-[#E4DBCA] hover:border-[#B64847]/60'
                }`}
              >
                <p className="font-bold text-[#B64847] mb-1">{language === 'id' ? 'Anggota Asosiasi' : 'Associate Member'}</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'id'
                    ? 'Untuk non-WNI atau pendukung komunitas.'
                    : 'For non-Indonesian citizens or community supporters.'}
                </p>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {selectedMembershipType === 'associate' && (
                <div className="rounded-2xl border border-[#FEB602] bg-[#FEB602]/10 p-4">
                  <p className="text-xs text-[#303030] leading-relaxed">
                    {language === 'id'
                      ? 'Untuk non-WNI: keanggotaan ini tidak memiliki hak suara. Anggota asosiasi tidak dapat mencalonkan diri sebagai Presiden, Sekretaris, atau Bendahara PPIA Queensland.'
                      : 'For non-Indonesian citizens: this membership does not include voting rights. Associate members cannot run for President, Secretary, or Treasurer positions within PPIA Queensland.'}
                  </p>
                </div>
              )}

              {selectedMembershipType === 'associate' && (
                <label className="flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={agreeAssociateLimits}
                    onChange={(e) => setAgreeAssociateLimits(e.target.checked)}
                    className="mt-0.5 accent-[#B64847]"
                  />
                  {language === 'id'
                    ? 'Saya memahami bahwa keanggotaan asosiasi tidak memiliki hak suara dan tidak dapat mencalonkan diri sebagai Presiden, Sekretaris, atau Bendahara.'
                    : 'I understand that Associate membership has no voting rights and is not eligible for President, Secretary, or Treasurer roles.'}
                </label>
              )}

              <label className="flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                <input
                  type="checkbox"
                  checked={agreePrivacyUse}
                  onChange={(e) => setAgreePrivacyUse(e.target.checked)}
                  className="mt-0.5 accent-[#B64847]"
                />
                {language === 'id'
                  ? 'PPIA Queensland dapat menggunakan informasi Anda untuk keadaan darurat dan keperluan pemasaran. Kami tidak akan memberikan informasi Anda kepada pihak ketiga tanpa persetujuan Anda, atau untuk penggunaan pribadi tim kami.'
                  : 'PPIA Queensland may use your information in emergencies and for marketing purposes. We will not provide your information to third parties without your consent, or for personal use by our team.'}
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowSignupModal(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#B64847] text-[#B64847] font-bold uppercase tracking-widest text-xs hover:bg-[#B64847] hover:text-white transition-all"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={continueToRegister}
                disabled={
                  !selectedMembershipType ||
                  !agreePrivacyUse ||
                  (selectedMembershipType === 'associate' && !agreeAssociateLimits)
                }
                className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#303030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'id' ? 'Lanjut Daftar' : 'Continue to Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
