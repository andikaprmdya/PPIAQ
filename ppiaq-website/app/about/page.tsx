'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

const UNIVERSITIES = [
  { name: 'PPIA Griffith University - ISAGU', email: 'griffith@ppi-australia.org', instagram: '@ppiagriffith.isagu', logo: '/images/Isagu_Logo.png' },
  { name: 'PPIA James Cook University - JCU ISA', email: 'ppia.jcu.tc@gmail.com', instagram: '@jcuisa_tsv', logo: '/images/jcuisa_logo.png' },
  { name: 'PPIA University of Queensland - UQISA', email: 'uqisa.info@gmail.com', instagram: '@uqisa', logo: '/images/uqisa_logo.png' },
  { name: 'PPIA Queensland University of Technology - ISAQ', email: 'isaq.qut@gmail.com', instagram: '@ppiaqut', logo: '/images/ISAQ_Logo.png' },
];

interface TeamMember {
  id: string;
  name: string;
  role: { id: string; en: string };
  university: string;
  instagram: string;
  image: string;
  order: number;
}

export default function AboutPage() {
  const { language } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [viewMoreEnabled, setViewMoreEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTeamMembers = async () => {
      try {
        const res = await fetch('/api/team', { cache: 'no-store' });
        const data = await res.json();
        const members = Array.isArray(data?.data) ? data.data : [];
        const sortedPreview = [...members]
          .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
          .slice(0, 5);

        if (!isMounted) return;
        setTeamMembers(sortedPreview);
        setViewMoreEnabled(data?.meta?.viewMoreEnabled !== false);
      } catch (error) {
        console.error('Error fetching about team members:', error);
        if (!isMounted) return;
        setTeamMembers([]);
      } finally {
        if (isMounted) setTeamLoading(false);
      }
    };

    fetchTeamMembers();
    const intervalId = setInterval(fetchTeamMembers, 30000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-10 px-6 text-center relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <Image
            src="/images/PPIAQ_logo.png"
            alt="PPIA Queensland Logo"
            width={128}
            height={128}
            className="mx-auto mb-8"
          />

          <h1 className="font-tan-angleton font-bold text-3xl md:text-5xl text-[#B64847] leading-tight mb-4">
            {language === 'id' ? (
              <>
                Perhimpunan Pelajar Indonesia di Australia, <br className="hidden md:block" />
                Queensland (PPIA Queensland)
              </>
            ) : (
              <>
                The Indonesian Student Association in Australia, <br className="hidden md:block" />
                Queensland Chapter (PPIA Queensland)
              </>
            )}
          </h1>

          <p className="font-nickainley font-bold text-2xl md:text-3xl text-[#886644] mb-8 opacity-90">
            {language === 'id' ? 'Menyatukan Pelajar Indonesia di Sunshine State' : 'Uniting Indonesian Students in the Sunshine State'}
          </p>

          <div className="max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-[#303030]">
            <p>
              {language === 'id' ? (
                <>
                  Juga dikenal sebagai <span className="italic">Indonesian Student Association in Australia - Queensland Chapter</span>. 
                  Kami adalah satu dari delapan cabang resmi di bawah{' '}
                  <a href="#" className="text-[#B64847] underline font-bold decoration-[#FEB602] hover:text-[#886644] transition-colors">PPI Australia (PPIA)</a>. 
                  PPIA telah melayani komunitas pelajar Indonesia di Australia sejak 1981, dan PPIA Queensland sejak 1988.
                </>
              ) : (
                <>
                  Also known as the <span className="italic">Indonesian Student Association in Australia - Queensland Chapter</span>. 
                  We are one of eight official branches under{' '}
                  <a href="#" className="text-[#B64847] underline font-bold decoration-[#FEB602] hover:text-[#886644] transition-colors">PPI Australia (PPIA)</a>. 
                  PPIA have served the Indonesian students community in Australia since 1981, and PPIA Queensland since 1988.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* --- CENDRAWASIH DECORATION --- */}
      <div className="max-w-5xl mx-auto px-6 mb-12 flex flex-col items-center gap-6">
        <Image
          src="/images/Cendrawasih_Down.png"
          alt="Cendrawasih Bird Decoration"
          width={250}
          height={150}
        />

        {/* VISI MISI Button */}
        <a href="/visi-misi" className="px-8 py-3 bg-[#B64847] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-[#303030] transition-all shadow-lg active:scale-95">
          {language === 'id' ? 'Visi Misi' : 'Vision & Mission'}
        </a>
      </div>

      {/* --- BRANCHES SECTION --- */}
      <section className="py-16 px-6 bg-white shadow-sm rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] mb-4 uppercase tracking-tighter">
              {language === 'id' ? 'Asosiasi Cabang Kami' : 'Our branch associations'}
            </h2>
            <p className="max-w-3xl mx-auto text-base text-gray-600 leading-relaxed font-medium">
              {language === 'id' 
                ? 'Terdapat empat cabang resmi yang berafiliasi dengan PPIA dan PPIA Queensland. Mereka adalah perhimpunan pelajar Indonesia dari empat universitas di seluruh Queensland. Jika Anda berasal dari salah satu universitas ini, silakan jadikan organisasi cabang kami sebagai kontak pertama Anda.'
                : 'There are four official branches that are associated with PPIA and PPIA Queensland. They are Indonesian student association from four universities across Queensland. If you belong to any of these universities, please have our branch organisations as your first point of contact,'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {UNIVERSITIES.map((uni, i) => (
              <div key={i} className="group bg-[#FFFAF5] border border-[#E4DBCA] rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#B64847] group-hover:translate-x-1 transition-transform flex-1">{uni.name}</h3>
                  {uni.logo && (
                    <Image
                      src={uni.logo}
                      alt={uni.name}
                      width={48}
                      height={48}
                      className="ml-2 shrink-0"
                    />
                  )}
                </div>
                <div className="space-y-2 text-[#886644] font-bold text-sm">
                  <p className="flex items-center gap-3 tracking-tight">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#FEB602] text-[#B64847] rounded-full text-xs">
                      <SiGmail className="text-[12px]" aria-hidden="true" />
                    </span>
                    {uni.email}
                  </p>
                  <p className="flex items-center gap-3 tracking-tight">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#FEB602] text-[#B64847] rounded-full text-xs">
                      <FaInstagram className="text-[12px]" aria-hidden="true" />
                    </span>
                    {uni.instagram}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#B64847] text-white rounded-r-4xl rounded-l-none p-10 border-l-8 border-[#FEB602] max-w-5xl ml-0 mr-auto shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <p className="relative z-10 text-sm md:text-base leading-relaxed italic font-medium">
              {language === 'id'
                ? 'Jika Anda bukan mahasiswa di Griffith University, JCU, UQ, atau QUT, jangan ragu untuk menghubungi PPIAQ secara langsung untuk keanggotaan dan dukungan lainnya yang Anda butuhkan. Jika Anda ingin memulai asosiasi cabang resmi di institusi Anda, silakan hubungi kami. Kebijakan PPIA mewajibkan minimal delapan anggota individu untuk memulai cabang PPIA.'
                : 'If you are not a student at Griffith University, JCU, UQ, or QUT, please feel free to reach out to PPIAQ directly for membership and other support you need. If you would like to start an official branch association in your institution, please contact us. PPIA policy requires a minimum of eight individual members to start a PPIA branch.'}
            </p>
          </div>
        </div>
      </section>

      {/* --- THE TEAM SECTION (5 Members in 1 Row) --- */}
      <section className="py-16 px-6 relative bg-[#FFFAF5]">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 border-40 border-[#FEB602] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 border-40 border-[#B64847] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="font-nickainley font-bold text-2xl text-[#886644] mb-1 tracking-wider">Dedicated & Passionate</p>
            <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847]">
              {getTranslation(translations.about.team.title, language)}
            </h2>
            <div className="h-1.5 w-20 bg-[#FEB602] mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Grid updated to lg:grid-cols-5 for 1 row on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {teamLoading ? (
              <div className="col-span-full text-center py-8 text-[#886644] font-bold">
                {language === 'id' ? 'Memuat anggota tim...' : 'Loading team members...'}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-[#886644] font-bold">
                {language === 'id' ? 'Belum ada anggota tim tersedia' : 'No team members available'}
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="group relative">
                  <div className="bg-white rounded-3xl p-5 text-center border border-[#E4DBCA] shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 flex flex-col h-full">
                    <div className="relative w-16 h-16 mx-auto mb-5 rounded-2xl overflow-hidden shadow-md border border-white/20">
                      <Image
                        src={member.image || '/images/PPIAQ_logo.png'}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-[#303030] mb-0.5 group-hover:text-[#B64847] transition-colors leading-tight">{member.name}</h3>
                    <p className="text-[#886644] font-bold text-[9px] uppercase tracking-widest mb-3">
                      {getTranslation(member.role, language)}
                    </p>
                    <div className="w-8 h-px bg-[#E4DBCA] mx-auto mb-3"></div>
                    <p className="text-[9px] text-gray-400 font-bold mb-4 grow flex items-center justify-center italic">
                      {member.university}
                    </p>
                    <a
                      href={`https://instagram.com/${(member.instagram || '').replace('@', '')}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#FFFAF5] border border-[#E4DBCA] text-[9px] font-bold text-[#B64847] hover:bg-[#B64847] hover:text-white transition-all shadow-sm"
                    >
                      {member.instagram || '@ppiaqueensland'}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 flex justify-center">
            {viewMoreEnabled ? (
              <Link
                href="/meet-the-team"
                className="px-8 py-3 bg-[#B64847] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-[#303030] transition-all shadow-lg inline-block"
              >
                {language === 'id' ? 'Lihat Semua Anggota' : 'View More Members'}
              </Link>
            ) : (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#886644] text-center">
                {language === 'id'
                  ? 'Tombol lihat semua anggota dinonaktifkan oleh admin'
                  : 'View more button is currently disabled by admin'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- CONTACT US SECTION (LOGO PLACEHOLDER REMOVED) --- */}
      <section className="py-16 px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-2 border-[#B64847] rounded-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Info Side */}
            <div className="bg-[#B64847] text-white p-10 md:w-1/2 flex flex-col justify-center relative">
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FEB602]/20 rounded-full blur-2xl"></div>
               <p className="font-nickainley font-bold text-3xl text-[#FEB602] mb-2 tracking-wide">Let&apos;s talk!</p>
               <p className="text-white/80 text-sm leading-relaxed mb-0 font-medium italic">
                  {language === 'id' 
                    ? 'Tim kami selalu siap membantu. Jangan ragu untuk menyapa atau menanyakan apa pun tentang kehidupan pelajar di Queensland.'
                    : 'Our team is always ready to help. Feel free to say hi or ask anything about student life in Queensland.'}
               </p>
            </div>
            
            {/* Action Side (Logo Placeholder Deleted) */}
            <div className="p-10 md:w-1/2 flex flex-col justify-center gap-6 bg-white relative">
               <a href="mailto:qld@ppi-australia.org" className="group flex items-center gap-5 p-4 rounded-3xl border border-[#E4DBCA] hover:border-[#FEB602] hover:bg-[#FFFAF5] transition-all duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-[#B64847] text-[#FEB602] rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform">
                    <SiGmail aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#886644] uppercase tracking-widest">Email Us</p>
                    <p className="text-lg font-bold text-[#303030]">qld@ppi-australia.org</p>
                  </div>
               </a>

               <a href="https://instagram.com/ppiaqueensland" className="group flex items-center gap-5 p-4 rounded-3xl border border-[#E4DBCA] hover:border-[#FEB602] hover:bg-[#FFFAF5] transition-all duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-[#FEB602] text-[#B64847] rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform">
                    <FaInstagram aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#886644] uppercase tracking-widest">Follow Us</p>
                    <p className="text-lg font-bold text-[#303030]">@ppiaqueensland</p>
                  </div>
               </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
