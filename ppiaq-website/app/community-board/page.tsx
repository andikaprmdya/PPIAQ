'use client';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type BilingualField = { id: string; en: string };

interface DBDiscount {
  id: string;
  name: BilingualField;
  description: BilingualField;
  code: string;
  validUntil: string;
}

interface DBResource {
  id: string;
  category: BilingualField;
  name: BilingualField;
  location: string;
}

interface DBAnnouncement {
  id: string;
  title: BilingualField;
  description: BilingualField;
  date: string;
}

export default function CommunityBoardPage() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [dbDiscounts, setDbDiscounts] = useState<DBDiscount[]>([]);
  const [dbResources, setDbResources] = useState<DBResource[]>([]);
  const [dbAnnouncements, setDbAnnouncements] = useState<DBAnnouncement[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetch('/api/community-board')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setDbDiscounts(data.discounts || []);
          setDbResources(data.resources || []);
          setDbAnnouncements(data.announcements || []);
        }
        setDbLoaded(true);
      })
      .catch(() => setDbLoaded(true));
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterError('');
    setNewsletterSuccess(false);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNewsletterError(data.error || (language === 'id' ? 'Subscription gagal' : 'Subscription failed'));
        return;
      }

      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 4000);
    } catch {
      setNewsletterError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
        </div>
      </main>
    );
  }

  const fallbackDiscounts = [
    {
      name: 'RACC',
      description: '- Financial support of AUD 1,500 over 3 years (paid - lumpsum)\n- Discounted service fee for TR - 485 visa\n- In-person event attendees: $200 RACC vouchers, win lucky draw prizes\n- O-Week participants will also be given goody bags supplied by RACC.',
      code: '- Instagram static posts: Once every two months. [Google Drive Link Provided]\n- Instagram story posts: 2x Monthly\n- Liking RACC posts.',
      validUntil: 'May 1, 2028',
    },
    {
      name: 'Happy Shop',
      description: '- Provide 5% discount for PPIA cardholders\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
      code: '- 1 Instagram story and 1 post per month\n- 5% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Medium logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'July 28, 2027',
    },
    {
      name: 'Shalom St Lucia',
      description: '- Provide 5% discount for PPIA cardholders - cash terms only\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
      code: '- 1 Instagram story and 1 post per month\n- 5% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Medium logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'March 18, 2027',
    },
    {
      name: 'Sendok Garpu [TBD]',
      description: '- Provide 10% discount for PPIA cardholders\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
      code: '- 1 Instagram story and 1 post per month\n- Re-sharing of SG\'s Instagram post on PPIAQ\'s IG story\n- 10% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Large logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'March 4, 2027',
    },
    {
      name: "Tuya's Taste",
      description: '- Provide 10% discount on agreed items for PPIA cardholders (direct buying from Tuya Taste store, including online store), Tuya Taste weekly market, and any Tuya Taste stall at special events such as Pesta Rakyat).\n- Acknowledge PPIA Queensland as one of Tuya Taste proud partners',
      code: '- 2 Instagram story and 1 post per month\n- 10% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Large logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'May 14, 2027',
    },
    {
      name: 'Uumu Tea',
      description: '- Buy 1 Large drink get 1 free (limited to 1 person per pop up)\n- 10% off catering orders',
      code: '- Guarantee a 10% discount for tenant fee at Pesta Rakyat 2026 (either pre or main event)\n- 2 Instagram posts on PPIAQ feed per MoU period\n- 2 Instagram reels / TikTok video per MoU period',
      validUntil: 'December 31, 2026',
    },
  ];

  const discounts = dbLoaded && dbDiscounts.length > 0
    ? dbDiscounts.map(d => ({ name: language === 'id' ? d.name.id : d.name.en, description: language === 'id' ? d.description.id : d.description.en, code: d.code, validUntil: d.validUntil }))
    : fallbackDiscounts;

  // Group DB resources by category
  const dbResourcesByCategory = dbResources.reduce((acc, r) => {
    const catKey = language === 'id' ? r.category.id : r.category.en;
    if (!acc[catKey]) acc[catKey] = [];
    acc[catKey].push({ name: language === 'id' ? r.name.id : r.name.en, location: r.location });
    return acc;
  }, {} as Record<string, { name: string; location: string }[]>);

  const fallbackResources = [
    { category: language === 'id' ? 'Restoran & Kafe' : 'Restaurants & Cafes', items: [{ name: 'Warung Makan Jaya', location: 'South Bank' }, { name: language === 'id' ? 'Kafe Indonesia' : 'Indonesian Cafe', location: 'City' }, { name: 'Nasi Kuning', location: 'Fortitude Valley' }] },
    { category: language === 'id' ? 'Akomodasi & Perumahan' : 'Accommodation & Housing', items: [{ name: language === 'id' ? 'Asrama Mahasiswa' : 'Student Dorm', location: 'West End' }, { name: language === 'id' ? 'Apartemen Bersama' : 'Shared Apartment', location: 'Milton' }, { name: language === 'id' ? 'Rumah Sewa' : 'Rental House', location: 'Southbank' }] },
    { category: language === 'id' ? 'Sumber Belajar' : 'Learning Resources', items: [{ name: language === 'id' ? 'Perpustakaan Universitas' : 'University Library', location: 'Each Campus' }, { name: language === 'id' ? 'Pusat Bahasa' : 'Language Center', location: 'City' }, { name: language === 'id' ? 'Studio Belajar Bersama' : 'Study Group Studio', location: 'Online' }] },
  ];

  const resources = dbLoaded && dbResources.length > 0
    ? Object.entries(dbResourcesByCategory).map(([category, items]) => ({ category, items }))
    : fallbackResources;
  const filteredResources = resources.filter(
    (resource) => !['Accommodation & Housing', 'Akomodasi & Perumahan'].includes(resource.category)
  );

  const fallbackAnnouncements = [
    { title: language === 'id' ? 'Pesta Rakyat 2026' : 'Pesta Rakyat 2026', date: '2026-08-17', description: language === 'id' ? 'Bergabunglah dengan perayaan Indonesian Independence Day terbesar di Queensland!' : 'Join the biggest Indonesian Independence Day celebration in Queensland!' },
    { title: language === 'id' ? 'Workshop Keterampilan' : 'Skills Workshop', date: '2026-03-15', description: language === 'id' ? 'Workshop gratis untuk anggota tentang pengembangan karir dan networking' : 'Free workshop for members on career development and networking' },
    { title: language === 'id' ? 'Gathering Bulanan' : 'Monthly Gathering', date: '2026-02-28', description: language === 'id' ? 'Acara rutin bulanan untuk mempererat hubungan antar anggota' : 'Regular monthly event to strengthen bonds among members' },
  ];

  const announcements = dbLoaded && dbAnnouncements.length > 0
    ? dbAnnouncements.map(a => ({ title: language === 'id' ? a.title.id : a.title.en, date: a.date, description: language === 'id' ? a.description.id : a.description.en }))
    : fallbackAnnouncements;

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="font-nickainley text-2xl text-[#886644] mb-2">
            {language === 'id' ? 'Untuk Anggota' : 'For Members'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl md:text-5xl text-[#B64847] uppercase tracking-tighter mb-4">
            {language === 'id' ? 'Papan Komunitas' : 'Community Board'}
          </h1>
          <div className="w-12 h-1 bg-[#FEB602] rounded-full"></div>
        </div>

        {/* Partner Discounts */}
        <section className="mb-16">
          <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-8">
            {language === 'id' ? 'Diskon Mitra' : 'Partner Discounts'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {discounts.map((discount, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-[#FEB602] p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-lg text-[#B64847] mb-4">{discount.name}</h3>

                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-2">
                    {language === 'id' ? 'Benefit untuk PPIAQ' : 'Benefits for PPIAQ'}
                  </p>
                  <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{discount.description}</p>
                </div>

                <div className="bg-[#FEB602]/10 rounded-xl p-4 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                    {language === 'id' ? 'Kewajiban Partnership' : 'Partnership Obligation'}
                  </p>
                  <p className="text-sm font-semibold text-[#B64847] whitespace-pre-line leading-relaxed">{discount.code}</p>
                </div>

                <p className="text-[10px] text-gray-400">
                  {language === 'id' ? 'Kontrak berakhir' : 'Contract end date'}:{' '}
                  {(() => {
                    const parsedDate = new Date(discount.validUntil);
                    return Number.isNaN(parsedDate.getTime())
                      ? discount.validUntil
                      : parsedDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US');
                  })()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Announcements */}
        <section className="mb-16">
          <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-8">
            {language === 'id' ? 'Pengumuman & Update' : 'Announcements & Updates'}
          </h2>

          <div className="space-y-4">
            {announcements.map((announcement, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E4DBCA] p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-[#B64847] flex-1">{announcement.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap ml-4">
                    {new Date(announcement.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                  </span>
                </div>
                <p className="text-gray-600">{announcement.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-8">
            {language === 'id' ? 'Sumber Daya & Vendor' : 'Resources & Vendors'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredResources.map((resource, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E4DBCA] p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-lg text-[#B64847] mb-4">{resource.category}</h3>

                <div className="space-y-3">
                  {resource.items.map((item, j) => (
                    <div key={j} className="border-l-4 border-[#FEB602] pl-4 py-2">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        📍 {item.location}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16">
          <div className="bg-white rounded-3xl border-2 border-[#FEB602] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-3">
                {language === 'id' ? 'Tetap Terhubung' : 'Stay Updated'}
              </h2>
              <p className="text-gray-600 mb-1 leading-relaxed">
                {language === 'id'
                  ? 'Berlangganan newsletter kami untuk mendapatkan update terbaru tentang acara dan peluang komunitas'
                  : 'Subscribe to our newsletter for the latest updates on events and community opportunities'}
              </p>
              <div className="w-12 h-1 bg-[#FEB602] rounded-full mt-4"></div>
            </div>

            {/* Right Form */}
            <form className="flex flex-col gap-3 w-full md:w-auto" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={language === 'id' ? 'Email Anda' : 'your@email.com'}
                className="px-6 py-3 border border-[#E4DBCA] rounded-2xl focus:outline-none focus:border-[#B64847] transition-all text-sm w-full md:w-64"
                required
              />
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-8 py-3 bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#303030] transition-all shadow-md disabled:opacity-50"
                >
                  {newsletterLoading ? (language === 'id' ? 'Sedang...' : 'Loading...') : (language === 'id' ? 'Berlangganan' : 'Subscribe')}
                </button>
                {newsletterSuccess && (
                  <p className="text-green-600 text-xs font-bold">✓ {language === 'id' ? 'Berhasil berlangganan!' : 'Successfully subscribed!'}</p>
                )}
                {newsletterError && (
                  <p className="text-red-600 text-xs font-bold">✗ {newsletterError}</p>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
