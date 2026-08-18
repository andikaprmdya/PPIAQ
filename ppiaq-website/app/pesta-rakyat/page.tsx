'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  DEFAULT_PESRA_COMMUNITY_SUPPORTERS,
  DEFAULT_PESRA_SPONSORS,
  getPesraText,
  mergePesraDefaults,
  type PesraContentItem,
} from '@/lib/pesra-content';

function PesraCopy({ text, className }: { text: string; className: string }) {
  const registrationUrl = 'bit.ly/CompetitionRegistrationPesra2026';

  return (
    <div className={className}>
      {text.split(/\n\s*\n/).map((paragraph, index) => {
        const parts = paragraph.split(registrationUrl);

        return (
          <p key={`${index}-${paragraph.slice(0, 12)}`}>
            {parts[0]}
            {parts.length > 1 && (
              <a
                href={`https://${registrationUrl}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#B64847] underline underline-offset-2 hover:text-[#303030]"
              >
                {registrationUrl}
              </a>
            )}
            {parts[1]}
          </p>
        );
      })}
    </div>
  );
}

export default function PestaRakyatPage() {
  const { language } = useLanguage();
  const [contentItems, setContentItems] = useState<PesraContentItem[]>([]);

  useEffect(() => {
    let isActive = true;

    const fetchSponsorLogos = async () => {
      try {
        const res = await fetch('/api/content?page=pesta-rakyat', { cache: 'no-store' });
        const data = await res.json();
        const items = Array.isArray(data.data) ? data.data : [];

        if (isActive) {
          setContentItems(items);
        }
      } catch (error) {
        console.error('Error fetching Pesra content:', error);
        if (isActive) {
          setContentItems([]);
        }
      }
    };

    fetchSponsorLogos();
    return () => {
      isActive = false;
    };
  }, []);

  const getSponsorLabel = (sponsor: PesraContentItem) => (
    sponsor.content[language] || sponsor.content.en || sponsor.content.id || 'Pesta Rakyat sponsor'
  );

  const defaultSponsorKeys = new Set(DEFAULT_PESRA_SPONSORS.map((sponsor) => sponsor.key));
  const storedSponsors = contentItems.filter(
    (item) => item.section === 'sponsors' && (defaultSponsorKeys.has(item.key) || item.content.placement)
  );
  const storedSupporters = contentItems.filter((item) => item.section === 'community-supporters');
  const sponsorItems = mergePesraDefaults(DEFAULT_PESRA_SPONSORS, storedSponsors);
  const supporterItems = mergePesraDefaults(DEFAULT_PESRA_COMMUNITY_SUPPORTERS, storedSupporters);
  const featuredSponsors = sponsorItems.filter((sponsor) => sponsor.content.placement === 'featured');
  const standardSponsors = sponsorItems.filter((sponsor) => sponsor.content.placement !== 'featured');
  const sponsorHeading = getPesraText(contentItems, 'pesta_sponsors_heading', language);
  const communityHeading = getPesraText(contentItems, 'pesta_community_heading', language);
  const eventDate = getPesraText(contentItems, 'pesta_event_date', language);
  const eventIntro = getPesraText(contentItems, 'pesta_event_intro', language);
  const eventDescription = getPesraText(contentItems, 'pesta_event_description', language);

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen overflow-x-hidden">
      
      {/* --- HERO SECTION (COMPACTED) --- */}
      {/* Reduced py-20/16 to py-16/12. Reduced font size of main title slightly. Reduced margins. */}
      <section className="relative pt-16 pb-12 px-6 bg-[#FEB602]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 border-32 border-[#B64847] rounded-full -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 border-48 border-[#B64847] rounded-full -mr-48 -mb-48"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <span className="bg-[#B64847] text-white px-5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] mb-6 shadow-lg">
              Est. 1988 • Queensland
            </span>
            <p className="font-nickainley text-2xl md:text-4xl text-[#B64847] mb-2 leading-none">
              Indonesian Student Association presents
            </p>
            {/* Font size reduced from 9xl to 8xl max */}
            <h1 className="font-tan-angleton font-bold text-5xl md:text-8xl text-[#B64847] leading-none uppercase tracking-tighter mb-6">
              PESTA <br className="md:hidden" /> RAKYAT
            </h1>
            <div className="flex items-center gap-4 w-full max-w-lg">
              <div className="h-px bg-[#B64847]/40 grow"></div>
              <span className="max-w-[15rem] text-center font-tan-angleton text-sm md:text-2xl text-[#B64847] leading-tight">{eventDate}</span>
              <div className="h-px bg-[#B64847]/40 grow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTRO SECTION (COMPACTED) --- */}
      {/* Reduced py-24 to py-16. Tightened gaps and vertical spacing. Reduced heading size. */}
      <section className="py-16 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="hidden lg:block lg:col-span-1">
             <p className="font-tan-angleton text-6xl text-[#E4DBCA] origin-left -rotate-90 whitespace-nowrap opacity-40 select-none">
               CULTURAL HERITAGE
             </p>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-tan-angleton text-3xl md:text-4xl text-[#B64847] leading-tight">
              {language === 'id' ? "Perayaan Budaya Terbesar di Queensland" : "Queensland's Premier Indonesian Cultural Showcase"}
            </h2>
            <div className="w-16 h-1 bg-[#FEB602]"></div>
            <PesraCopy text={eventIntro} className="space-y-4 text-gray-600 leading-relaxed text-base md:text-lg italic border-l-4 border-[#E4DBCA] pl-6" />
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-4xl border border-[#E4DBCA] shadow-2xl shadow-[#B64847]/5 relative">
            <PesraCopy text={eventDescription} className="space-y-5 text-gray-700 leading-relaxed text-sm md:text-base font-medium" />
            <div className="mt-6 flex justify-end opacity-20">
               <div className="w-12 h-12 border-2 border-dashed border-[#886644] rounded-full flex items-center justify-center text-[6px] font-bold">[LOGO]</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE HEART OF PESRA (COMPACTED) --- */}
      {/* Reduced py-20 to py-16. Reduced mb-16 to mb-10. Reduced card padding from p-10 to p-8. Reduced number size. */}
      <section className="py-16 bg-[#B64847] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex flex-wrap gap-10 p-10">
           {[...Array(20)].map((_, i) => <div key={i} className="w-20 h-20 border border-white rounded-full"></div>)}
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="font-tan-angleton text-3xl md:text-4xl text-[#FEB602] mb-2">{language === 'id' ? 'Jantung Pesra' : 'The Heart of Pesra'}</h2>
            <p className="font-nickainley text-2xl text-white opacity-80 italic">{language === 'id' ? 'Apa yang membuat perayaan hidup' : 'What makes the celebration alive'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(language === 'id' ? [
              { num: '01', title: 'Imersif Budaya', desc: 'Memperkenalkan seni yang berakar dalam, tarian tradisional, dan warisan visual kepulauan.' },
              { num: '02', title: 'Perjalanan Gastronomi', desc: 'Pilihan pilihan warisan kuliner Indonesia, dari makanan jalanan hingga kelezatan kerajaan.' },
              { num: '03', title: 'Persatuan Komunitas', desc: 'Memperkuat ikatan antara diaspora Indonesia dan komunitas Australia lokal.' }
            ] : [
              { num: '01', title: 'Cultural Immersion', desc: 'Introducing the deep-rooted arts, traditional dances, and visual heritage of the archipelago.' },
              { num: '02', title: 'Gastronomic Journey', desc: 'A curated selection of Indonesia\'s culinary heritage, from street-food to royal delicacies.' },
              { num: '03', title: 'Community Unity', desc: 'Strengthening ties between the Indonesian diaspora and the local Australian community.' }
            ]).map((item, i) => (
              <div key={i} className="group bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-4xl hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <span className="font-tan-angleton text-5xl text-[#FEB602] mb-4 block group-hover:scale-105 transition-transform">{item.num}</span>
                <h4 className="font-bold text-white group-hover:text-[#B64847] text-lg mb-3 tracking-widest uppercase">{item.title}</h4>
                <p className="text-xs md:text-sm text-white/70 group-hover:text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- GALLERY SECTION (ALREADY COMPACTED) --- */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-tan-angleton text-2xl md:text-3xl text-[#B64847] uppercase tracking-widest mb-1">{language === 'id' ? 'Penglihatan Perayaan' : 'Glimpses of Celebration'}</h2>
          <div className="h-1 w-16 bg-[#FEB602] mx-auto mb-3 rounded-full"></div>
          <p className="font-nickainley text-xl text-[#886644] italic">{language === 'id' ? 'Momen tertangkap dari tahun-tahun sebelumnya' : 'Captured moments from previous years'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-auto md:h-112.5">
          <div className="md:col-span-2 md:row-span-2 border border-[#E4DBCA] rounded-3xl flex items-center justify-center shadow-sm overflow-hidden group">
            <Image
              src="/images/pesra biggest box.jpg"
              alt="Pesra Gallery - Featured"
              width={500}
              height={500}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="aspect-square md:aspect-auto border border-[#E4DBCA] rounded-2xl flex items-center justify-center shadow-sm hover:border-[#FEB602] transition-all overflow-hidden group">
            <Image
              src="/images/pesra 1.jpg"
              alt="Pesra Gallery 1"
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square md:aspect-auto border border-[#E4DBCA] rounded-2xl flex items-center justify-center shadow-sm hover:border-[#FEB602] transition-all overflow-hidden group">
            <Image
              src="/images/pesra 2.jpg"
              alt="Pesra Gallery 2"
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square md:aspect-auto border border-[#E4DBCA] rounded-2xl flex items-center justify-center shadow-sm hover:border-[#FEB602] transition-all overflow-hidden group">
            <Image
              src="/images/pesra 3.jpg"
              alt="Pesra Gallery 3"
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square md:aspect-auto border border-[#E4DBCA] rounded-2xl flex items-center justify-center shadow-sm hover:border-[#FEB602] transition-all overflow-hidden group">
            <Image
              src="/images/pesra 4.jpg"
              alt="Pesra Gallery 4"
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        <div className="mt-3 w-full h-32 border border-[#E4DBCA] rounded-2xl shadow-sm hover:border-[#FEB602] transition-all overflow-hidden group">
          <Image
            src="/images/pesra rectangle.jpg"
            alt="Pesra Gallery - Panoramic"
            width={800}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      <section className="py-14 px-6 bg-white border-y border-[#E4DBCA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="mx-auto max-w-3xl font-tan-angleton text-2xl md:text-3xl text-[#B64847] uppercase tracking-widest mb-3">
              {sponsorHeading}
            </h2>
            <div className="h-1 w-16 bg-[#FEB602] mx-auto rounded-full"></div>
          </div>

          {featuredSponsors.length > 0 && (
            <div className="flex justify-center mb-8">
              {featuredSponsors.map((sponsor) => sponsor.image && (
                <div key={sponsor.key} className="h-44 w-40 sm:h-52 sm:w-48 flex items-center justify-center">
                  <img
                    src={sponsor.image}
                    alt={getSponsorLabel(sponsor)}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {standardSponsors.map((sponsor) => sponsor.image && (
              <div key={sponsor.key} className="h-28 w-44 sm:h-32 sm:w-56 flex items-center justify-center">
                <img
                  src={sponsor.image}
                  alt={getSponsorLabel(sponsor)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-[#E4DBCA] pt-10">
            <div className="text-center mb-8">
              <h3 className="mx-auto max-w-4xl font-tan-angleton text-xl md:text-2xl text-[#B64847] uppercase tracking-widest mb-3">
                {communityHeading}
              </h3>
              <div className="h-1 w-16 bg-[#FEB602] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
              {supporterItems.map((supporter) => (
                <div key={supporter.key} className="min-h-28 rounded-2xl border border-[#E4DBCA] bg-[#FFFAF5] p-4 flex flex-col items-center justify-center text-center">
                  {supporter.image && (
                    <div className="h-24 w-full flex items-center justify-center mb-3">
                      <img
                        src={supporter.image}
                        alt={getSponsorLabel(supporter)}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <p className="text-xs font-bold leading-relaxed text-[#303030]">{getSponsorLabel(supporter)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CENDRAWASIH FOOTER --- */}
      <div className="py-12 px-6 flex justify-center">
        <Image
          src="/images/Cendrawasih_Down.png"
          alt="Cendrawasih Bird"
          width={200}
          height={150}
        />
      </div>

    </main>
  );
}
