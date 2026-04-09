'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

type AccommodationItem = {
  name: { id: string; en: string };
  location: string;
  website: string;
};

const ACCOMMODATION_LIST: AccommodationItem[] = [
  {
    name: { id: 'Asrama Mahasiswa', en: 'Student Dorm' },
    location: 'West End',
    website: 'https://www.unilodge.com.au/',
  },
  {
    name: { id: 'Apartemen Bersama', en: 'Shared Apartment' },
    location: 'Milton',
    website: 'https://flatmates.com.au/',
  },
  {
    name: { id: 'Rumah Sewa', en: 'Rental House' },
    location: 'Southbank',
    website: 'https://www.realestate.com.au/rent/',
  },
];

const GUIDE_BOOKLET_URL =
  'https://drive.google.com/file/d/1C5Fo4Pb1mzVaILTIPYlgkhlzb1pOCmJw/view?usp=sharing';

export default function GuideToQueenslandPage() {
  const { language } = useLanguage();

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
              ? 'Link website untuk setiap akomodasi sudah ditambahkan agar partner/members bisa akses info lebih cepat.'
              : 'Website links are added for each accommodation so partners and members can access details quickly.'}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border border-[#E4DBCA] rounded-2xl overflow-hidden">
              <thead className="bg-[#B64847] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                    {language === 'id' ? 'Akomodasi' : 'Accommodation'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                    {language === 'id' ? 'Area' : 'Area'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest">
                    Website
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCOMMODATION_LIST.map((item) => (
                  <tr key={`${item.name.en}-${item.location}`} className="border-t border-[#E4DBCA] hover:bg-[#FFFAF5]">
                    <td className="px-4 py-3 text-sm font-semibold text-[#303030]">
                      {language === 'id' ? item.name.id : item.name.en}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#303030]">{item.location}</td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B64847] font-semibold hover:text-[#9a3a3e] hover:underline break-all"
                      >
                        {item.website}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
