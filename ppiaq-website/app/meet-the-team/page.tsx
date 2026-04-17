'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';

interface TeamMember {
  id: string;
  name: string;
  role: { id: string; en: string };
  university: string;
  instagram: string;
  image: string;
  bio: { id: string; en: string };
  division: string;
  order: number;
  isActive: boolean;
}

const DIVISION_META = [
  { id: 'ADMIN',       name: { id: 'Administrasi & Logistik',    en: 'Administration & Logistics' } },
  { id: 'EDUCATION',   name: { id: 'Pendidikan & Pengembangan',   en: 'Education & Development' } },
  { id: 'SPORTS',      name: { id: 'Olahraga, Seni & Budaya',     en: 'Sports, Arts & Culture' } },
  { id: 'MEDIA',       name: { id: 'Media & Komunikasi',          en: 'Media & Communications' } },
  { id: 'PARTNERSHIP', name: { id: 'Kemitraan',                   en: 'Partnership' } },
];

export default function MeetTheTeamPage() {
  const { language } = useLanguage();
  const [coreMembers, setCoreMembers] = useState<TeamMember[]>([]);
  const [divisionMembers, setDivisionMembers] = useState<Record<string, TeamMember[]>>({});
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTeamMembers = async () => {
      try {
        const res = await fetch('/api/team', { cache: 'no-store' });
        const data = await res.json();
        const all: TeamMember[] = (data.data || []).sort(
          (a: TeamMember, b: TeamMember) => a.order - b.order
        );

        if (!isMounted) return;

        // Core team: division === 'CORE' (uppercase from DB)
        setCoreMembers(all.filter((m) => m.division === 'CORE'));

        // Group non-core members by division
        const grouped: Record<string, TeamMember[]> = {};
        all
          .filter((m) => m.division !== 'CORE')
          .forEach((m) => {
            if (!grouped[m.division]) grouped[m.division] = [];
            grouped[m.division].push(m);
          });
        setDivisionMembers(grouped);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTeamMembers();
    const intervalId = setInterval(fetchTeamMembers, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const getTranslation = (obj: { id: string; en: string } | string) => {
    if (typeof obj === 'string') return obj;
    return language === 'id' ? obj.id : obj.en;
  };

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-10 px-6 text-center relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="font-tan-angleton font-bold text-3xl md:text-5xl text-[#B64847] leading-tight mb-4">
            {language === 'id' ? 'Bertemu Dengan Tim' : 'Meet the Team'}
          </h1>

          <p className="font-nickainley font-bold text-2xl md:text-3xl text-[#886644] mb-8 opacity-90">
            {language === 'id' ? 'Kabinet PAGI 2026' : 'Kabinet PAGI 2026'}
          </p>

          <div className="max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-[#303030]">
            <p className="italic">
              {language === 'id'
                ? 'Tim kami terdiri dari anggota-anggota yang berdedikasi, terdiri dari presiden terpilih, dua wakil presiden, seorang sekretaris, seorang bendahara, dan lima divisi yang menjalankan program-program asosiasi sepanjang tahun.'
                : 'Our team consists of dedicated members, comprised of an elected president, two vice presidents, a secretary, a treasurer, and five divisions that run the association\'s programs throughout the year.'}
            </p>
          </div>
        </div>
      </section>

      {/* --- DECORATIVE DIVIDER --- */}
      <div className="max-w-5xl mx-auto px-6 mb-16 flex justify-center">
        <div className="h-1 w-20 bg-[#FEB602] rounded-full"></div>
      </div>

      {/* --- CORE TEAM SECTION --- */}
      <section className="py-16 px-6 bg-[#FFFAF5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] mb-4 uppercase tracking-tighter">
              {language === 'id' ? 'Tim Inti' : 'Core Team'}
            </h2>
            <div className="h-1.5 w-20 bg-[#FEB602] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-[#886644]">
                {language === 'id' ? 'Memuat anggota tim...' : 'Loading team members...'}
              </div>
            ) : coreMembers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-[#886644]">
                {language === 'id' ? 'Belum ada anggota tim tersedia' : 'No team members available'}
              </div>
            ) : (
              coreMembers.map((member) => (
                <div key={member.id} className="group relative">
                  <div className="bg-white rounded-3xl p-5 text-center border border-[#E4DBCA] shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 flex flex-col h-full cursor-pointer" onClick={() => setSelectedMember(member)}>
                    <div className="relative w-16 h-16 mx-auto mb-5 rounded-2xl overflow-hidden shadow-md border border-white/20">
                      <Image
                        src={member.image || '/images/PPIAQ_logo.png'}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-[#303030] mb-0.5 group-hover:text-[#B64847] transition-colors leading-tight cursor-pointer hover:underline">
                      {member.name}
                    </h3>
                    <p className="text-[#886644] font-bold text-[9px] uppercase tracking-widest mb-3">
                      {getTranslation(member.role)}
                    </p>
                    <div className="w-8 h-px bg-[#E4DBCA] mx-auto mb-3"></div>
                    <p className="text-[9px] text-gray-400 font-bold mb-4 grow flex items-center justify-center italic">
                      {member.university}
                    </p>
                    <a
                      href={`https://instagram.com/${(member.instagram || '').replace('@', '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#FFFAF5] border border-[#E4DBCA] text-[9px] font-bold text-[#B64847] hover:bg-[#B64847] hover:text-white transition-all shadow-sm"
                    >
                      {member.instagram || '@ppiaqueensland'}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- DIVISIONS GRID --- */}
      <section className="py-16 px-6 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto">
          {DIVISION_META.map((division, idx) => {
            const members = divisionMembers[division.id] || [];
            if (!loading && members.length === 0) return null;
            return (
              <div key={division.id} className="mb-16 last:mb-0">
                {/* Division Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#B64847] text-white rounded-lg font-bold text-sm">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-bold text-2xl text-[#B64847] flex-1">
                      {getTranslation(division.name)}
                    </h3>
                  </div>
                  <div className="h-1 w-12 bg-[#FEB602] rounded-full"></div>
                </div>

                {/* Members Grid for Division */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center py-8 text-[#886644]">
                      {language === 'id' ? 'Memuat...' : 'Loading...'}
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="group relative cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="bg-white rounded-3xl p-5 text-center border border-[#E4DBCA] shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 flex flex-col h-full">
                          {/* Image Container */}
                          <div className="relative w-16 h-16 mx-auto mb-5 rounded-2xl overflow-hidden shadow-md border border-white/20 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#B64847]/20 to-[#FEB602]/20">
                                <span className="text-lg font-bold text-[#B64847] opacity-60">
                                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <h3 className="font-bold text-sm text-[#303030] mb-0.5 group-hover:text-[#B64847] transition-colors leading-tight">
                            {member.name}
                          </h3>

                          {/* Role */}
                          <p className="text-[#886644] font-bold text-[9px] uppercase tracking-widest mb-3">
                            {getTranslation(member.role)}
                          </p>

                          {/* Divider */}
                          <div className="w-8 h-px bg-[#E4DBCA] mx-auto mb-3"></div>

                          {/* University */}
                          <p className="text-[9px] text-gray-400 font-bold mb-4 grow flex items-center justify-center italic">
                            {member.university}
                          </p>

                          {/* Instagram */}
                          <a
                            href={`https://instagram.com/${(member.instagram || '').replace('@', '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#FFFAF5] border border-[#E4DBCA] text-[9px] font-bold text-[#B64847] hover:bg-[#B64847] hover:text-white transition-all shadow-sm"
                          >
                            {member.instagram || '@ppiaqueensland'}
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- TEAM STRUCTURE INFO --- */}
      <section className="py-16 px-6 bg-[#FFFAF5]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-2 border-[#B64847] rounded-3xl overflow-hidden">
            <div className="bg-[#B64847] text-white p-10 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <p className="font-nickainley font-bold text-2xl text-[#FEB602] mb-3 tracking-wide relative z-10">
                {language === 'id' ? 'Struktur Organisasi' : 'Organization Structure'}
              </p>
              <h3 className="font-tan-angleton font-bold text-3xl mb-4 relative z-10">
                {language === 'id' ? 'Total 16 Anggota Tim' : 'Total 16 Team Members'}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed relative z-10 max-w-2xl">
                {language === 'id'
                  ? 'Kabinet PAGI 2026 terdiri dari lima divisi dengan berbagai peran dan tanggung jawab yang bekerja sama untuk melayani komunitas pelajar Indonesia di Queensland.'
                  : 'Kabinet PAGI 2026 consists of five divisions with various roles and responsibilities working together to serve the Indonesian student community in Queensland.'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
              <div className="p-6 border-r border-b border-[#E4DBCA] text-center">
                <p className="text-3xl font-bold text-[#B64847] mb-2">5</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#886644]">
                  {language === 'id' ? 'Divisi' : 'Divisions'}
                </p>
              </div>
              <div className="p-6 border-r border-b border-[#E4DBCA] text-center md:border-b-0">
                <p className="text-3xl font-bold text-[#B64847] mb-2">5</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#886644]">
                  {language === 'id' ? 'Direktur' : 'Directors'}
                </p>
              </div>
              <div className="p-6 border-r border-b border-[#E4DBCA] text-center md:border-r-0 md:border-b">
                <p className="text-3xl font-bold text-[#B64847] mb-2">10</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#886644]">
                  {language === 'id' ? 'Petugas' : 'Officers'}
                </p>
              </div>
              <div className="p-6 border-r border-[#E4DBCA] text-center md:border-b-0">
                <p className="text-3xl font-bold text-[#B64847] mb-2">16</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#886644]">
                  {language === 'id' ? 'Total' : 'Total'}
                </p>
              </div>
              <div className="p-6 text-center">
                <p className="text-3xl font-bold text-[#B64847] mb-2">1</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#886644]">
                  {language === 'id' ? 'Tujuan' : 'Mission'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] mb-6">
            {language === 'id' ? 'Ingin Bergabung Dengan Tim?' : 'Want to Join Our Team?'}
          </h2>
          <p className="text-lg text-[#303030] leading-relaxed mb-8 max-w-2xl mx-auto">
            {language === 'id'
              ? 'Kami selalu mencari individu yang passionate dan committed untuk membantu menggerakkan komunitas pelajar Indonesia di Queensland. Hubungi kami untuk mengetahui lebih lanjut.'
              : 'We\'re always looking for passionate and committed individuals to help drive the Indonesian student community in Queensland. Contact us to learn more.'}
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-[#B64847] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-[#303030] transition-all shadow-lg active:scale-95"
          >
            {language === 'id' ? 'Hubungi Kami' : 'Contact Us'}
          </a>
        </div>
      </section>

      {/* --- MODAL --- */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setSelectedMember(null)}
        >
          {/* Blur Background */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedMember(null)}></div>

          {/* Modal Content */}
          <div
            className="relative z-10 bg-white rounded-3xl max-w-md w-full shadow-2xl animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-[#B64847] text-white rounded-full hover:bg-[#303030] transition-all z-20 shadow-lg hover:scale-110 active:scale-95"
            >
              <span className="text-xl">✕</span>
            </button>

            {/* Member Image */}
            <div className="relative w-full h-64 bg-gray-200">
              <Image
                src={selectedMember.image || '/images/PPIAQ_logo.png'}
                alt={selectedMember.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20"></div>
            </div>

            {/* Member Info */}
            <div className="p-8">
              <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
                {selectedMember.name}
              </h2>

              <p className="text-[#886644] font-bold text-sm uppercase tracking-widest mb-4">
                {getTranslation(selectedMember.role)}
              </p>

              <div className="h-1 w-12 bg-[#FEB602] rounded-full mb-6"></div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                {selectedMember.university}
              </p>

              <p className="text-[#303030] text-base leading-relaxed mb-6">
                {getTranslation(selectedMember.bio)}
              </p>

              {/* Instagram Link */}
              <a
                href={`https://instagram.com/${(selectedMember.instagram || '').replace('@', '')}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#B64847] text-white font-bold text-sm rounded-xl hover:bg-[#303030] transition-all shadow-lg active:scale-95"
              >
                <span>📱</span>
                {selectedMember.instagram || '@ppiaqueensland'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
