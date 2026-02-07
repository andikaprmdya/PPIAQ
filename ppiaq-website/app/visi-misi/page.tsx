'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';

export default function VisiMisiPage() {
  const { language } = useLanguage();

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-10 px-6 text-center relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="font-tan-angleton font-bold text-3xl md:text-5xl text-[#B64847] leading-tight mb-4">
            {language === 'id' ? 'Visi & Misi' : 'Vision & Mission'}
          </h1>

          <p className="font-nickainley font-bold text-2xl md:text-3xl text-[#886644] mb-8 opacity-90">
            {language === 'id' ? 'Menggerakkan Pelajar Indonesia Maju' : 'Moving Indonesian Students Forward'}
          </p>

          <div className="max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-[#303030]">
            <p className="italic mb-6">
              {language === 'id'
                ? 'Pada tahun 2026, PPIAQ dipimpin oleh Kabinet PAGI - Pelajar Aktif, Gerak & Inklusif. Tim terdiri dari ketua terpilih, dua wakil ketua, seorang sekretaris, seorang bendahara, dan lima divisi untuk menjalankan program asosiasi sepanjang tahun.'
                : 'In 2026, PPIAQ is taken care by Kabinet PAGI - Pelajar Aktif, Gerak & Inklusif. The team consists of an elected president, two vice presidents, a secretary, a treasurer, and five divisions to run the association\'s programs throughout the year.'}
            </p>
          </div>
        </div>
      </section>

      {/* --- CENDRAWASIH DECORATION --- */}
      <div className="max-w-5xl mx-auto px-6 mb-12 flex justify-center">
        <Image
          src="/images/Cendrawasih_Down.png"
          alt="Cendrawasih Bird Decoration"
          width={250}
          height={150}
        />
      </div>

      {/* --- VISION SECTION --- */}
      <section className="py-16 px-6 bg-white shadow-sm rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] mb-4 uppercase tracking-tighter">
              {language === 'id' ? 'Visi' : 'Vision'}
            </h2>
            <div className="h-1.5 w-20 bg-[#FEB602] rounded-full mb-8"></div>

            <div className="space-y-6 max-w-4xl">
              <p className="text-lg text-[#303030] leading-relaxed font-medium">
                {language === 'id'
                  ? 'Membangun perhimpunan yang mengayomi ranting, mewadahi aspirasi, dan menjembatani kolaborasi antar-pelajar yang responsif, representatif, dan inklusif'
                  : 'Creating an association that nurtures its branch member associations, creating space for members\' aspiration, and bridging inter-students collaboration that is responsive, representative, and inclusive'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MISSION SECTION --- */}
      <section className="py-16 px-6 bg-[#FFFAF5]">
        <div className="max-w-6xl mx-auto">
          <div>
            <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] mb-4 uppercase tracking-tighter">
              {language === 'id' ? 'Misi' : 'Mission'}
            </h2>
            <div className="h-1.5 w-20 bg-[#FEB602] rounded-full mb-12"></div>

            <div className="space-y-8 max-w-5xl">
              {/* Mission 1: Mengayomi Ranting / Nurturing member branch organisations */}
              <div className="border-l-4 border-[#B64847] bg-white p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#B64847]/10 rounded-lg">
                    <span className="text-[#B64847] font-bold text-lg">01</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-[#B64847] mb-4">
                      {language === 'id' ? 'Mengayomi Ranting' : 'Nurturing Member Branches'}
                    </h3>
                    <ul className="space-y-3 text-sm text-[#303030] leading-relaxed">
                      <li className="flex gap-3">
                        <span className="text-[#FEB602] font-bold mt-0.5">—</span>
                        <span>
                          {language === 'id'
                            ? 'Mendukung organisasi ranting menurut kebutuhan program masing-masing'
                            : 'Supporting branch organisations according to their unique needs'}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#FEB602] font-bold mt-0.5">—</span>
                        <span>
                          {language === 'id'
                            ? 'Menambahkan representasi di PPIAQ dari setiap organisasi ranting dan mahasiswa Indonesia di seluruh Queensland'
                            : 'Adding more representation in PPIAQ from each branch organisation and wider-reaching Indonesian students in Queensland'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mission 2: Menyalurkan Aspirasi / Creating space for members' aspirations */}
              <div className="border-l-4 border-[#B64847] bg-white p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#B64847]/10 rounded-lg">
                    <span className="text-[#B64847] font-bold text-lg">02</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-[#B64847] mb-4">
                      {language === 'id' ? 'Menyalurkan Aspirasi' : 'Creating Space for Aspirations'}
                    </h3>
                    <ul className="space-y-3 text-sm text-[#303030] leading-relaxed">
                      <li className="flex gap-3">
                        <span className="text-[#FEB602] font-bold mt-0.5">—</span>
                        <span>
                          {language === 'id'
                            ? 'Melanjutkan program-program yang mengasah, menampilkan, dan memberdayakan kemampuan dan aspirasi mahasiswa Indonesia di Queensland'
                            : 'Delivering programs that develop, showcase, and empower Indonesian students in Queensland'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mission 3: Jembatan untuk Indonesia & Queensland / Bridging Indonesia and Queensland */}
              <div className="border-l-4 border-[#B64847] bg-white p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#B64847]/10 rounded-lg">
                    <span className="text-[#B64847] font-bold text-lg">03</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-[#B64847] mb-4">
                      {language === 'id' ? 'Jembatan Indonesia & Queensland' : 'Bridging Indonesia & Queensland'}
                    </h3>
                    <ul className="space-y-3 text-sm text-[#303030] leading-relaxed">
                      <li className="flex gap-3">
                        <span className="text-[#FEB602] font-bold mt-0.5">—</span>
                        <span>
                          {language === 'id'
                            ? 'Menjadi information hub yang menghubungkan mahasiswa Indonesia ke orang-orang dan kesempatan yang dibutuhkan'
                            : 'Becoming an information hub that connects Indonesian students to opportunities and network in Queensland'}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#FEB602] font-bold mt-0.5">—</span>
                        <span>
                          {language === 'id'
                            ? 'Memberikan wadah untuk warga Queensland yang ingin berkolaborasi dan belajar tentang Indonesia lewat program PPIAQ dan/atau organisasi ranting'
                            : 'Create avenues for Queenslander to collaborate with Indonesian students and learn about Indonesia through PPIAQ and branch organisation\'s programs'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES SECTION --- */}
      <section className="py-16 px-6 relative bg-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 border-40 border-[#FEB602] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 border-40 border-[#B64847] rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="font-nickainley font-bold text-2xl text-[#886644] mb-2 tracking-wider">
              {language === 'id' ? 'Nilai-Nilai Kami' : 'Our Values'}
            </p>
            <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847]">
              {language === 'id' ? 'Responsif, Representatif, Inklusif' : 'Responsive, Representative, Inclusive'}
            </h2>
            <div className="h-1.5 w-20 bg-[#FEB602] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-[#FFFAF5] border border-[#E4DBCA] rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300">
              <p className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-3">01</p>
              <h3 className="font-bold text-lg text-[#B64847] mb-3 group-hover:translate-x-1 transition-transform">
                {language === 'id' ? 'Responsif' : 'Responsive'}
              </h3>
              <p className="text-sm text-[#303030] leading-relaxed">
                {language === 'id'
                  ? 'Tanggap terhadap kebutuhan dan aspirasi setiap anggota komunitas'
                  : 'Responsive to the needs and aspirations of every community member'}
              </p>
            </div>

            <div className="group bg-[#FFFAF5] border border-[#E4DBCA] rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300">
              <p className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-3">02</p>
              <h3 className="font-bold text-lg text-[#B64847] mb-3 group-hover:translate-x-1 transition-transform">
                {language === 'id' ? 'Representatif' : 'Representative'}
              </h3>
              <p className="text-sm text-[#303030] leading-relaxed">
                {language === 'id'
                  ? 'Mewakili suara semua pelajar Indonesia di Queensland'
                  : 'Representing the voices of all Indonesian students in Queensland'}
              </p>
            </div>

            <div className="group bg-[#FFFAF5] border border-[#E4DBCA] rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300">
              <p className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-3">03</p>
              <h3 className="font-bold text-lg text-[#B64847] mb-3 group-hover:translate-x-1 transition-transform">
                {language === 'id' ? 'Inklusif' : 'Inclusive'}
              </h3>
              <p className="text-sm text-[#303030] leading-relaxed">
                {language === 'id'
                  ? 'Terbuka dan mengundang semua untuk berpartisipasi dalam komunitas'
                  : 'Open and welcoming to all who wish to participate in our community'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 px-6 bg-[#FFFAF5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] mb-6">
            {language === 'id' ? 'Jadilah Bagian dari Perjalanan Kami' : 'Be Part of Our Journey'}
          </h2>
          <p className="text-lg text-[#303030] leading-relaxed mb-8 max-w-2xl mx-auto">
            {language === 'id'
              ? 'Dengan visi dan misi yang jelas, kami mengundang Anda untuk bergabung dengan komunitas PPIAQ dan bersama-sama menciptakan dampak positif bagi pelajar Indonesia di Queensland.'
              : 'With a clear vision and mission, we invite you to join the PPIAQ community and together create a positive impact for Indonesian students in Queensland.'}
          </p>
          <a
            href="/membership"
            className="inline-block px-8 py-3 bg-[#B64847] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-[#303030] transition-all shadow-lg active:scale-95"
          >
            {language === 'id' ? 'Jadilah Anggota' : 'Become a Member'}
          </a>
        </div>
      </section>
    </main>
  );
}
