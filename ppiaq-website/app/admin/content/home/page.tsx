'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';
import ContentEditModal from '@/components/admin/content/ContentEditModal';
import { createTranslator } from '@/lib/translations';

interface ContentData {
  id: string;
  key: string;
  section: string;
  content: { id: string; en: string };
  image?: string;
  type: string;
  page: string;
}

interface EditingState {
  section: ContentData | null;
  isOpen: boolean;
}

export default function HomeContentAdminPage() {
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [contentData, setContentData] = useState<ContentData[]>([]);
  const [editing, setEditing] = useState<EditingState>({ section: null, isOpen: false });
  const [currentBg, setCurrentBg] = useState(0);

  const backgroundImages = [
    '/images/pesra 1.jpg',
    '/images/pesra 2.jpg',
    '/images/pesra 3.jpg',
    '/images/pesra 4.jpg',
    '/images/pesra biggest box.jpg',
    '/images/pesra rectangle.jpg',
    '/images/qutmarketday.jpg',
    '/images/uqmarketday.jpg',
  ];

  async function fetchContent() {
    try {
      const url = new URL('/api/admin/content', window.location.origin);
      url.searchParams.set('page', 'home');

      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API error:', res.status, errorData);
        return;
      }

      const data = await res.json();
      setContentData(data.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  }

  useEffect(() => {
    void (async () => {
      await fetchContent();
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getContent = (key: string) => {
    const item = contentData.find((c) => c.key === key);
    return item?.content || { id: '', en: '' };
  };

  const handleEditSection = (key: string, defaultSection: string) => {
    const content = contentData.find((c) => c.key === key);
    setEditing({
      section: content || {
        id: '',
        key,
        section: defaultSection,
        content: { id: '', en: '' },
        type: 'TEXT',
        page: 'home',
      },
      isOpen: true,
    });
  };

  const handleSave = async (updatedData: Record<string, unknown>) => {
    if (!editing.section) return;

    const endpoint = editing.section.id ? `/api/admin/content/${editing.section.id}` : '/api/admin/content';
    const method = editing.section.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          key: editing.section.key,
          page: 'home',
          section: editing.section.section,
          order: 0,
        }),
      });

      if (res.ok) {
        fetchContent();
        setEditing({ section: null, isOpen: false });
      } else {
        alert(t('admin.content.failedToSaveContent', 'Failed to save'));
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(t('admin.content.failedToSaveContent', 'Failed to save'));
    }
  };

  const heroTitle = getContent('hero_title');
  const heroSubtitle = getContent('hero_subtitle');

  return (
    <main className="font-montserrat text-[#303030] bg-[#FFFAF5] overflow-x-hidden">
      {/* HERO SECTION */}
      <section
        className="group/hero text-white py-20 px-6 min-h-[70vh] flex items-center relative overflow-hidden"
        onMouseEnter={() => {}}
      >
        {/* Background Carousel */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {backgroundImages.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Background ${index}`}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                currentBg === index ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
            />
          ))}
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Edit Button */}
        <button
          onClick={() => handleEditSection('hero_title', 'hero')}
          className="absolute top-4 right-4 opacity-0 group-hover/hero:opacity-100 transition-opacity z-20 bg-[#B64847] text-white px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#303030] shadow-lg"
        >
          {t('common.edit', 'Edit')} Hero
        </button>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <Image
            src="/images/Cendrawasih_Up.png"
            alt="Cendrawasih"
            width={300}
            height={400}
            priority
            className="shrink-0"
          />

          <div className="text-center md:text-left">
            <h1 className="font-tan-angleton font-bold text-5xl md:text-7xl mb-6 text-[#FEB602]">
              {heroTitle[language === 'id' ? 'id' : 'en'] || 'Welcome to PPIA Queensland!'}
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-90 leading-relaxed italic">
              {heroSubtitle[language === 'id' ? 'id' : 'en'] || 'Welcome text here'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="px-8 py-3 bg-white text-[#B64847] font-bold rounded-sm hover:bg-[#FEB602] transition-colors uppercase tracking-wider text-sm">
                {t('admin.content.learnMoreAboutUs', 'Learn More About Us')}
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-sm hover:bg-white hover:text-[#B64847] transition-all uppercase tracking-wider text-sm">
                {t('home.cta.joinMembership', 'Become a Member')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {editing.isOpen && editing.section && (
        <ContentEditModal
          section={editing.section}
          isOpen={editing.isOpen}
          onClose={() => setEditing({ section: null, isOpen: false })}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
