'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMail } from 'react-icons/fi';
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useLanguage } from '@/lib/language-context';
import { useFormSubmit } from '@/lib/hooks/useFormSubmit';
import { API_ENDPOINTS } from '@/lib/constants';

interface FAQItem {
  id: string;
  question: { id: string; en: string };
  answer: { id: string; en: string };
}

interface EventItem {
  id: string;
  day: string;
  month: string;
  title: { id: string; en: string };
  date: string;
  organizer?: string | null;
  location: { id: string; en: string };
  image: string;
  registrationUrl?: string;
}

type EventOrganizerFilter = 'all' | 'ppiaq' | 'uqisa' | 'qut' | 'griffith' | 'jcu' | 'other';

const HERO_SLIDER_IMAGES = [
  '/images/pesra 1.jpg',
  '/images/pesra 2.jpg',
  '/images/pesra 3.jpg',
  '/images/pesra 4.jpg',
  '/images/pesra biggest box.jpg',
  '/images/pesra rectangle.jpg',
  '/images/qutmarketday.jpg',
  '/images/uqmarketday.jpg',
];

const eventDetailRoutes: Record<string, string> = {
  'Pre-Departure Briefing - Semester 1, 2026': '/events/pre-departure-briefing',
  'QUT Market Day - Join ISAQ / PPIA QUT': '/events/qut-market-day',
  'UQ St. Lucia Market Day - Join UQISA / PPIA UQ': '/events/uq-market-day',
};

const EVENT_ORGANIZER_FILTERS: Array<{ key: EventOrganizerFilter; label: { id: string; en: string } }> = [
  { key: 'all', label: { id: 'Semua', en: 'All' } },
  { key: 'ppiaq', label: { id: 'PPIAQ', en: 'PPIAQ' } },
  { key: 'uqisa', label: { id: 'UQISA', en: 'UQISA' } },
  { key: 'qut', label: { id: 'QUT', en: 'QUT' } },
  { key: 'griffith', label: { id: 'Griffith', en: 'Griffith' } },
  { key: 'jcu', label: { id: 'JCU', en: 'JCU' } },
  { key: 'other', label: { id: 'Lainnya', en: 'Other' } },
];

const EVENT_ORGANIZER_LABELS: Record<EventOrganizerFilter, { id: string; en: string }> = {
  all: { id: 'Semua', en: 'All' },
  ppiaq: { id: 'PPIAQ', en: 'PPIAQ' },
  uqisa: { id: 'UQISA', en: 'UQISA' },
  qut: { id: 'QUT', en: 'QUT' },
  griffith: { id: 'Griffith', en: 'Griffith' },
  jcu: { id: 'JCU', en: 'JCU' },
  other: { id: 'Lainnya', en: 'Other' },
};

const mapOrganizerTextToKey = (organizerText: string): Exclude<EventOrganizerFilter, 'all'> => {
  const normalized = organizerText.toLowerCase();

  if (/uqisa|\buq\b|ppia uq/.test(normalized)) return 'uqisa';
  if (/qut|isaq|ppia qut/.test(normalized)) return 'qut';
  if (/griffith|griffin|gisa/.test(normalized)) return 'griffith';
  if (/jcu|jcuisa/.test(normalized)) return 'jcu';
  if (/ppiaq|ppiaqueensland|ppia queensland|ppi queensland|queensland chapter/.test(normalized)) return 'ppiaq';

  return 'other';
};

const getEventOrganizerKey = (event: EventItem): Exclude<EventOrganizerFilter, 'all'> => {
  if (event.organizer && event.organizer.trim()) {
    return mapOrganizerTextToKey(event.organizer);
  }

  const searchableText = `${event.title.en} ${event.title.id} ${event.location.en} ${event.location.id} ${event.registrationUrl || ''}`.toLowerCase();

  if (searchableText.includes('pre-departure')) return 'ppiaq';
  return mapOrganizerTextToKey(searchableText);
};

export default function HomePage() {
  const { language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<EventOrganizerFilter>('all');
  const [currentBg, setCurrentBg] = useState(0);
  const { submit: submitNewsletter, loading: newsletterLoading, success: newsletterSuccess, error: newsletterError } = useFormSubmit();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await fetch('/api/faq?page=home');
        const data = await res.json();
        setFaqData(data.data || []);
      } catch (error) {
        console.error('Error fetching FAQ:', error);
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFAQ();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_SLIDER_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitNewsletter({
      endpoint: API_ENDPOINTS.NEWSLETTER_SUBSCRIBE,
      data: { email: newsletterEmail },
      onSuccess: () => setNewsletterEmail(''),
    });
  };

  const getFAQDisplay = () => {
    if (faqLoading) return [];
    return faqData.map((item) => ({
      q: language === 'id' ? item.question.id : item.question.en,
      a: language === 'id' ? item.answer.id : item.answer.en,
    }));
  };

  const displayFAQ = getFAQDisplay();
  const communityEvents = events
    .filter((event) => {
      if (selectedOrganizer === 'all') return true;
      return getEventOrganizerKey(event) === selectedOrganizer;
    })
    .slice(0, 3);
  const handlePreviousImage = () => {
    setCurrentBg((prev) => (prev - 1 + HERO_SLIDER_IMAGES.length) % HERO_SLIDER_IMAGES.length);
  };
  const handleNextImage = () => {
    setCurrentBg((prev) => (prev + 1) % HERO_SLIDER_IMAGES.length);
  };

  return (
    <main className="font-montserrat text-[#303030] bg-[#FFFAF5] overflow-x-hidden">
      <section className="text-white py-20 px-6 min-h-[70vh] flex items-center relative overflow-hidden bg-[#B64847]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
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
                : 'Welcome! We connect Indonesian students all over Queensland to opportunities, and to each other.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/membership"
                className="px-6 py-4 bg-white text-[#B64847] font-bold rounded-lg hover:bg-[#FEB602] hover:text-[#303030] transition-colors uppercase tracking-wider text-xs text-center shadow-md"
              >
                {language === 'id' ? 'Jadilah Anggota' : 'Become a Member'}
              </Link>
              <Link
                href="/guide-to-queensland"
                className="px-6 py-4 bg-white text-[#B64847] font-bold rounded-lg hover:bg-[#FEB602] hover:text-[#303030] transition-colors uppercase tracking-wider text-xs text-center shadow-md"
              >
                {language === 'id' ? 'Panduan Queensland' : 'Guide to Queensland Booklet'}
              </Link>
              <Link
                href="/about"
                className="px-6 py-4 bg-white text-[#B64847] font-bold rounded-lg hover:bg-[#FEB602] hover:text-[#303030] transition-colors uppercase tracking-wider text-xs text-center shadow-md"
              >
                {language === 'id' ? 'Pelajari Tentang Kami' : 'Learn More About Us'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-6 bg-[#FFFAF5]">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden border border-[#E4DBCA] shadow-md bg-white">
            <button
              type="button"
              onClick={handlePreviousImage}
              aria-label={language === 'id' ? 'Gambar sebelumnya' : 'Previous image'}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white font-bold text-lg hover:bg-black/65 transition-all"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={language === 'id' ? 'Gambar selanjutnya' : 'Next image'}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white font-bold text-lg hover:bg-black/65 transition-all"
            >
              →
            </button>
            {HERO_SLIDER_IMAGES.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt={`PPIAQ activities ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-700 ${
                  currentBg === index ? 'opacity-100' : 'opacity-0'
                }`}
                priority={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#E4DBCA]/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847] text-center mb-16">
            {language === 'id' ? 'Acara Komunitas' : 'Community Event'}
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {EVENT_ORGANIZER_FILTERS.map((filterItem) => {
              const isActive = selectedOrganizer === filterItem.key;
              return (
                <button
                  key={filterItem.key}
                  type="button"
                  onClick={() => setSelectedOrganizer(filterItem.key)}
                  className={`px-4 py-2 rounded-full border text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#B64847] text-white border-[#B64847] shadow-sm'
                      : 'bg-white text-[#886644] border-[#E4DBCA] hover:border-[#B64847] hover:text-[#B64847]'
                  }`}
                >
                  {language === 'id' ? filterItem.label.id : filterItem.label.en}
                </button>
              );
            })}
          </div>

          {eventsLoading ? (
            <div className="text-center py-8 text-[#886644]">
              {language === 'id' ? 'Memuat acara...' : 'Loading events...'}
            </div>
          ) : communityEvents.length === 0 ? (
            <div className="text-center py-8 text-[#886644]">
              {language === 'id' ? 'Belum ada acara komunitas' : 'No community events available'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {communityEvents.map((event) => {
                const title = language === 'id' ? event.title.id : event.title.en;
                const location = language === 'id' ? event.location.id : event.location.en;
                const organizer = getEventOrganizerKey(event);
                const href = eventDetailRoutes[event.title.en] || event.registrationUrl || '#';
                const imageSrc = event.image || '/images/PPIAQ_logo.png';

                const card = (
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#E4DBCA] group hover:-translate-y-1.25 h-full cursor-pointer">
                    <div className="h-48 bg-gray-200 relative flex items-center justify-center text-gray-400 italic overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={title}
                        width={300}
                        height={192}
                        className="object-cover w-full h-full"
                        unoptimized={imageSrc.startsWith('data:')}
                      />
                      <div className="absolute top-4 left-4 bg-[#B64847] text-white p-2 min-w-12 text-center rounded-md">
                        <p className="text-xl font-bold leading-none">{event.day}</p>
                        <p className="text-xs">{event.month}</p>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/95 text-[#B64847] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#E4DBCA]">
                        {language === 'id' ? EVENT_ORGANIZER_LABELS[organizer].id : EVENT_ORGANIZER_LABELS[organizer].en}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-4 group-hover:text-[#B64847] transition-colors">{title}</h3>
                      <div className="space-y-1 text-sm text-gray-500 font-medium">
                        <p>{language === 'id' ? 'Tanggal' : 'Date'}: {event.date}</p>
                        <p>{language === 'id' ? 'Lokasi' : 'Location'}: {location}</p>
                      </div>
                    </div>
                  </div>
                );

                if (href === '#') {
                  return <div key={event.id}>{card}</div>;
                }

                return (
                  <Link key={event.id} href={href} className="block">
                    {card}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847] mb-12">
            {language === 'id' ? 'Pertanyaan yang Sering Diajukan' : 'Frequently asked questions'}
          </h2>

          <div className="space-y-4">
            {faqLoading ? (
              <div className="text-center py-8 text-[#886644]">{language === 'id' ? 'Memuat FAQ...' : 'Loading FAQs...'}</div>
            ) : displayFAQ.length === 0 ? (
              <div className="text-center py-8 text-[#886644]">{language === 'id' ? 'Belum ada FAQ' : 'No FAQs available'}</div>
            ) : (
              displayFAQ.map((faq, i) => (
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
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#FFFAF5]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20">
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
              {newsletterSuccess && (
                <p className="text-green-600 text-xs font-bold">
                  {language === 'id' ? 'Berhasil!' : 'Success!'} {language === 'id' ? 'Berhasil berlangganan!' : 'Successfully subscribed!'}
                </p>
              )}
              {newsletterError && (
                <p className="text-red-600 text-xs font-bold">
                  {language === 'id' ? 'Kesalahan' : 'Error'}: {newsletterError}
                </p>
              )}
              <button type="submit" disabled={newsletterLoading} className="px-10 py-4 border border-black text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all disabled:opacity-50">
                {newsletterLoading ? (language === 'id' ? 'Mengirim...' : 'Sending...') : (language === 'id' ? 'Berlangganan Newsletter' : 'Subscribe to Newsletter')}
              </button>
            </form>
          </div>

          <div className="flex-1">
            <h3 className="font-tan-angleton font-bold text-5xl text-[#B64847] mb-8">
              {language === 'id' ? 'Hubungi Kami' : 'Contact us'}
            </h3>
            <div className="space-y-6 text-lg text-gray-700">
              <div className="space-y-1">
                <p className="font-medium leading-relaxed">
                  {language === 'id'
                    ? 'Perhimpunan Pelajar Indonesia di Australia Cabang Queensland'
                    : 'The Indonesian Student Association in Australia - Queensland Chapter'}
                </p>
                <p className="font-bold tracking-wide">ABN 82 422 047 615</p>
              </div>
              <p className="font-bold flex items-center gap-3">
                <FiMail className="text-[#B64847] text-xl shrink-0" aria-hidden="true" />
                <a href="mailto:qld@ppi-australia.org" className="text-[#B64847] hover:underline">qld@ppi-australia.org</a>
              </p>
              <div className="pt-4 flex items-center gap-3">
                <a
                  href="https://instagram.com/ppiaqueensland"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg text-2xl hover:bg-[#B64847] hover:border-[#B64847] hover:text-white transition-all"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.linkedin.com/company/ppia-queensland/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg text-2xl hover:bg-[#B64847] hover:border-[#B64847] hover:text-white transition-all"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
