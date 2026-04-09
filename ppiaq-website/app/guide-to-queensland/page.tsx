'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';

type AccommodationOption = {
  name: { id: string; en: string };
  website: string;
  photoLink: string;
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
      },
      {
        name: { id: 'UniLodge', en: 'UniLodge' },
        website: 'https://www.unilodge.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=unilodge+brisbane',
      },
      {
        name: { id: 'Scape', en: 'Scape' },
        website: 'https://www.scape.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=scape+brisbane',
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
      },
      {
        name: { id: 'Flatmate Finders', en: 'Flatmate Finders' },
        website: 'https://flatmatefinders.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=shared+apartment+brisbane',
      },
      {
        name: { id: 'Gumtree Flatshare', en: 'Gumtree Flatshare' },
        website: 'https://www.gumtree.com.au/s-flatshare-houseshare/brisbane/c18294l3005721',
        photoLink: 'https://www.google.com/search?tbm=isch&q=gumtree+flatshare+brisbane',
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
      },
      {
        name: { id: 'Domain', en: 'Domain' },
        website: 'https://www.domain.com.au/rent/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=domain+brisbane+rent',
      },
      {
        name: { id: 'Rent.com.au', en: 'Rent.com.au' },
        website: 'https://www.rent.com.au/',
        photoLink: 'https://www.google.com/search?tbm=isch&q=rent.com.au+brisbane',
      },
    ],
  },
];

const GUIDE_BOOKLET_URL =
  'https://drive.google.com/file/d/1C5Fo4Pb1mzVaILTIPYlgkhlzb1pOCmJw/view?usp=sharing';

export default function GuideToQueenslandPage() {
  const { language } = useLanguage();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(ACCOMMODATION_CATEGORIES[0]?.id || null);

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
              const isOpen = openCategoryId === category.id;

              return (
                <div
                  key={category.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isOpen
                      ? 'bg-[#B64847] text-white border-[#B64847] shadow-lg'
                      : 'bg-[#FFFAF5] border-[#E4DBCA] text-[#303030] hover:border-[#B64847] hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">
                    {language === 'id' ? category.title.id : category.title.en}
                  </h3>
                  <p className={`text-sm mb-4 ${isOpen ? 'text-white/90' : 'text-[#6a5f54]'}`}>
                    {language === 'id' ? category.summary.id : category.summary.en}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenCategoryId((prev) => (prev === category.id ? null : category.id))}
                    className={`w-full rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                      isOpen
                        ? 'bg-white text-[#B64847] hover:bg-[#FFF3DA]'
                        : 'bg-[#B64847] text-white hover:bg-[#9a3a3e]'
                    }`}
                  >
                    {isOpen
                      ? language === 'id'
                        ? 'Sembunyikan Detail'
                        : 'Hide Details'
                      : language === 'id'
                        ? 'Lihat Detail'
                        : 'View More'}
                  </button>
                </div>
              );
            })}
          </div>

          {openCategoryId && (
            <div className="mt-6 bg-[#FFFAF5] border border-[#E4DBCA] rounded-2xl p-4 md:p-5">
              <h3 className="font-bold text-base text-[#B64847] mb-4">
                {(() => {
                  const activeCategory = ACCOMMODATION_CATEGORIES.find((item) => item.id === openCategoryId);
                  if (!activeCategory) return '';
                  return language === 'id' ? activeCategory.title.id : activeCategory.title.en;
                })()}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(ACCOMMODATION_CATEGORIES.find((item) => item.id === openCategoryId)?.options || []).map((option) => (
                  <div key={option.name.en} className="bg-white border border-[#E4DBCA] rounded-xl p-4">
                    <p className="font-semibold text-[#303030] mb-3">
                      {language === 'id' ? option.name.id : option.name.en}
                    </p>
                    <div className="space-y-2 text-sm">
                      <a
                        href={option.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[#B64847] font-semibold hover:text-[#9a3a3e] hover:underline break-all"
                      >
                        {language === 'id' ? 'Website: ' : 'Website: '}
                        {option.website}
                      </a>
                      <a
                        href={option.photoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[#886644] font-semibold hover:text-[#B64847] hover:underline break-all"
                      >
                        {language === 'id' ? 'Foto Google: ' : 'Google Photos: '}
                        {option.photoLink}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={GUIDE_BOOKLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#B64847] text-white rounded-xl hover:bg-[#9a3a3e] font-bold uppercase tracking-widest text-xs transition-all"
          >
            {language === 'id' ? 'Buka Booklet Resmi' : 'Open Official Booklet'}
          </a>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-[#E4DBCA] text-[#886644] rounded-xl hover:border-[#B64847] hover:text-[#B64847] font-bold uppercase tracking-widest text-xs transition-all"
          >
            {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </main>
  );
}
