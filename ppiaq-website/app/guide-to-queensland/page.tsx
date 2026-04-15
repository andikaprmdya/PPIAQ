'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/lib/language-context';

type AccommodationOption = {
  name: { id: string; en: string };
  website: string;
  photoLink: string;
  logoUrl: string;
};

type AccommodationCategory = {
  id: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  options: AccommodationOption[];
};

const ACCOMMODATION_CATEGORIES: AccommodationCategory[] = [
  {
    id: 'student-dorm',
    title: { id: 'Asrama Mahasiswa', en: 'Student Dorm' },
    summary: {
      id: 'Akomodasi khusus pelajar dengan fasilitas siap pakai.',
      en: 'Student-focused accommodation with ready-to-use facilities.',
    },
    options: [
      {
        name: { id: 'Student One', en: 'Student One' },
        website: 'https://studentone.com/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=student+one+brisbane',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=studentone.com&sz=256',
      },
      {
        name: { id: 'UniLodge', en: 'UniLodge' },
        website: 'https://www.unilodge.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=unilodge+brisbane',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=unilodge.com.au&sz=256',
      },
      {
        name: { id: 'Scape', en: 'Scape' },
        website: 'https://www.scape.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=scape+brisbane',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=scape.com.au&sz=256',
      },
    ],
  },
  {
    id: 'shared-apartment',
    title: { id: 'Apartemen Bersama', en: 'Shared Apartment' },
    summary: {
      id: 'Cocok untuk berbagi biaya tempat tinggal dengan teman sekamar.',
      en: 'Best for splitting living costs with housemates.',
    },
    options: [
      {
        name: { id: 'Flatmates', en: 'Flatmates' },
        website: 'https://flatmates.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=flatmates+brisbane+apartment',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=flatmates.com.au&sz=256',
      },
      {
        name: { id: 'Flatmate Finders', en: 'Flatmate Finders' },
        website: 'https://flatmatefinders.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=shared+apartment+brisbane',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=flatmatefinders.com.au&sz=256',
      },
      {
        name: { id: 'Gumtree Flatshare', en: 'Gumtree Flatshare' },
        website: 'https://www.gumtree.com.au/s-flatshare-houseshare/brisbane/c18294l3005721',
        photoLink: 'https://www.google.com/search?tbm=isch&q=gumtree+flatshare+brisbane',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=gumtree.com.au&sz=256',
      },
    ],
  },
  {
    id: 'rental-house',
    title: { id: 'Rumah Sewa', en: 'Rental House' },
    summary: {
      id: 'Pilihan rumah sewa untuk tinggal sendiri maupun bersama keluarga.',
      en: 'Rental homes for solo living or family stay.',
    },
    options: [
      {
        name: { id: 'Realestate.com.au', en: 'Realestate.com.au' },
        website: 'https://www.realestate.com.au/rent/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=brisbane+rental+house',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=realestate.com.au&sz=256',
      },
      {
        name: { id: 'Domain', en: 'Domain' },
        website: 'https://www.domain.com.au/rent/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=domain+brisbane+rent',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=domain.com.au&sz=256',
      },
      {
        name: { id: 'Rent.com.au', en: 'Rent.com.au' },
        website: 'https://www.rent.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=rent.com.au+brisbane',
        logoUrl: 'https://www.google.com/s2/favicons?domain_url=rent.com.au&sz=256',
      },
    ],
  },
];

const GUIDE_BOOKLET_URL =
  'https://drive.google.com/file/d/1C5Fo4Pb1mzVaILTIPYlgkhlzb1pOCmJw/view?usp=sharing';

export default function GuideToQueenslandPage() {
  const { language } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = useMemo(
    () => ACCOMMODATION_CATEGORIES.find((item) => item.id === selectedCategoryId) || null,
    [selectedCategoryId]
  );

  useEffect(() => {
    if (!selectedCategoryId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCategoryId(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCategoryId]);

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="font-nickainley text-2xl text-[#886644] mb-2">
            {language === 'id' ? 'Referensi anggota' : 'Member reference'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl md:text-5xl text-[#B64847] uppercase tracking-tighter mb-4">
            {language === 'id' ? 'Panduan Queensland' : 'Guide to Queensland Booklet'}
          </h1>
          <div className="w-12 h-1 bg-[#FEB602] rounded-full"></div>
          <div className="mt-6 flex justify-center md:justify-end">
            <a
              href={GUIDE_BOOKLET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#B64847] text-white rounded-2xl hover:bg-[#9a3a3e] font-bold uppercase tracking-wider text-sm md:text-base transition-all shadow-md"
            >
              {language === 'id' ? 'Buka Booklet Resmi' : 'Open Official Booklet'}
            </a>
          </div>
        </div>

        <div className="bg-white border border-[#E4DBCA] rounded-3xl p-6 md:p-8 mb-8">
          <h2 className="font-bold text-xl text-[#B64847] mb-3">
            {language === 'id'
              ? 'Daftar Akomodasi + Link Website'
              : 'Accommodation List + Website Links'}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {language === 'id'
              ? 'Pilih kategori akomodasi di bawah. Setiap kategori punya daftar nama tempat, link website resmi, dan link foto Google.'
              : 'Choose an accommodation category below. Each category includes place names, official website links, and Google photo links.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACCOMMODATION_CATEGORIES.map((category) => {
              return (
                <div
                  key={category.id}
                  className="rounded-2xl border p-5 transition-all bg-[#FFFAF5] border-[#E4DBCA] text-[#303030] hover:border-[#B64847] hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E4DBCA] flex items-center justify-center mb-4 shadow-sm">
                    <img
                      src={category.options[0]?.logoUrl || '/favicon.ico'}
                      alt={`${language === 'id' ? category.title.id : category.title.en} logo`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    {language === 'id' ? category.title.id : category.title.en}
                  </h3>
                  <p className="text-sm mb-4 text-[#6a5f54]">
                    {language === 'id' ? category.summary.id : category.summary.en}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="w-full rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all bg-[#B64847] text-white hover:bg-[#9a3a3e]"
                  >
                    {language === 'id' ? 'Lihat Detail' : 'View More'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-6 py-3 border-2 border-[#E4DBCA] text-[#886644] rounded-xl hover:border-[#B64847] hover:text-[#B64847] font-bold uppercase tracking-widest text-xs transition-all"
          >
            {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
          </Link>
        </div>
      </div>

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label={language === 'id' ? 'Tutup popup' : 'Close popup'}
            onClick={() => setSelectedCategoryId(null)}
            className="absolute inset-0 bg-[#303030]/65 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl border border-[#E4DBCA] bg-white shadow-[0_30px_80px_rgba(48,48,48,0.25)]">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#E4DBCA] px-5 py-4 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#886644]">
                    {language === 'id' ? 'Detail Akomodasi' : 'Accommodation Details'}
                  </p>
                  <h3 className="mt-1 font-tan-angleton text-3xl text-[#B64847] font-bold">
                    {language === 'id' ? selectedCategory.title.id : selectedCategory.title.en}
                  </h3>
                  <p className="mt-2 text-sm text-[#6a5f54]">
                    {language === 'id' ? selectedCategory.summary.id : selectedCategory.summary.en}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="w-10 h-10 rounded-full border border-[#E4DBCA] bg-[#FFFAF5] text-[#886644] font-bold hover:border-[#B64847] hover:text-[#B64847] transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
              {selectedCategory.options.map((option) => (
                <div
                  key={option.name.en}
                  className="rounded-2xl border border-[#E4DBCA] overflow-hidden bg-[#FFFAF5] shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-36 bg-gradient-to-br from-[#FFF3DA] via-white to-[#FFE7CC] border-b border-[#E4DBCA] flex items-center justify-center">
                    <img
                      src={option.logoUrl}
                      alt={`${language === 'id' ? option.name.id : option.name.en} logo`}
                      className="w-20 h-20 object-contain rounded-2xl border border-[#E4DBCA] bg-white p-3 shadow-sm"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-[#303030] mb-3 text-lg">
                      {language === 'id' ? option.name.id : option.name.en}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={option.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest bg-[#B64847] text-white hover:bg-[#9a3a3e] transition-all"
                      >
                        {language === 'id' ? 'Buka Website' : 'Open Website'}
                      </a>
                      <a
                        href={option.photoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest border border-[#E4DBCA] text-[#886644] bg-white hover:border-[#B64847] hover:text-[#B64847] transition-all"
                      >
                        {language === 'id' ? 'Lihat Foto Google' : 'View Google Photos'}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
