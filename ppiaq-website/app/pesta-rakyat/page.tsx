'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';

export default function PestaRakyatPage() {
  const { language } = useLanguage();

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
              <span className="font-tan-angleton text-xl md:text-2xl text-[#B64847] whitespace-nowrap">Brisbane 2026</span>
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
            <div className="space-y-4 text-gray-600 leading-relaxed text-base md:text-lg italic border-l-4 border-[#E4DBCA] pl-6">
              <p>
                {language === 'id'
                  ? 'Pesta Rakyat (PesRa) adalah perayaan terbesar tahunan Hari Kemerdekaan Indonesia di Queensland, menyatukan ribuan mahasiswa Indonesia, keluarga diaspora, dan komunitas Australia yang lebih luas dalam pameran budaya, musik, makanan, dan kebanggaan nasional yang spektakuler.'
                  : 'Pesta Rakyat (PesRa) is Queensland\'s largest annual celebration of Indonesian Independence Day, uniting thousands of Indonesian students, diaspora families and the wider Australian community in a spectacular showcase of culture, music, food and national pride.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-4xl border border-[#E4DBCA] shadow-2xl shadow-[#B64847]/5 relative">
            <p className="text-gray-700 leading-relaxed text-sm md:text-base font-medium">
               {language === 'id'
                 ? 'Pesta Rakyat berfungsi sebagai platform bagi diaspora Indonesia di Queensland untuk memperkuat ikatan komunitas sambil memperkenalkan budaya, seni, dan warisan kuliner Indonesia kepada komunitas internasional.'
                 : 'Pesta Rakyat serves as a platform for the Indonesian diaspora in Queensland to strengthen community ties while introducing Indonesia\'s culture, arts, and culinary heritage to the international community.'}
            </p>
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

      {/* --- COLLABORATION & RECRUITMENT (ALREADY COMPACTED) --- */}
      <section className="py-12 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-2 border-[#B64847] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl">
            <div className="bg-[#B64847] p-8 md:w-1/2 text-white flex flex-col justify-center">
              <span className="font-nickainley text-2xl text-[#FEB602] mb-2">{language === 'id' ? 'Kami kembali!' : 'We are back!'}</span>
              <h2 className="font-tan-angleton text-3xl text-white mb-6">{language === 'id' ? 'Pesra Kembali di 2026' : 'Pesra is returning in 2026'}</h2>
              <p className="text-xs md:text-sm opacity-80 leading-relaxed italic">
                {language === 'id'
                  ? 'Pesra menyediakan ruang untuk kolaborasi antara siswa, komunitas Indonesia, dan mitra lokal, berkontribusi pada promosi citra Indonesia yang positif di luar negeri.'
                  : 'Pesra provides a space for collaboration among students, the Indonesian community, and local partners, contributing to the promotion of a positive image of Indonesia abroad.'}
              </p>
            </div>
            <div className="p-8 md:w-1/2 flex flex-col justify-center bg-white border-l border-[#B64847]/10">
              <h3 className="font-tan-angleton text-2xl text-[#B64847] mb-4">{language === 'id' ? 'Bergabung dengan Komite' : 'Join the Committee'}</h3>
              <p className="text-gray-600 text-xs md:text-sm mb-8 leading-relaxed font-medium">
                {language === 'id'
                  ? 'PPIA Queensland mencari tim acara untuk menjalankan Pesra di 2026. Ekspresikan minat Anda untuk menjadi bagian dari komite acara Pesta Rakyat di berbagai fungsi.'
                  : 'PPIA Queensland is looking for an events team to run Pesra in 2026. Express your interest to be part of Pesta Rakyat events committee across many different functions.'}
              </p>
              <a 
                href="mailto:qld@ppi-australia.org" 
                className="inline-block text-center bg-[#FEB602] text-[#B64847] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-[#B64847] hover:text-white transition-all shadow-md active:scale-95"
              >
                Send Expression of Interest
              </a>
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