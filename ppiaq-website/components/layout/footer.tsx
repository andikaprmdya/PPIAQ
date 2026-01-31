'use client';

import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';
import Link from 'next/link';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-[#1A1A1A] text-[#FFFAF5] pt-16 pb-8 relative overflow-hidden mt-0">
      {/* --- SEAMLESS ACCENT LINE --- */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FEB602]"></div>
      
      {/* Decorative Blur for Depth */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#B64847] rounded-full opacity-10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* --- BRANDING --- */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="group inline-block">
              <h2 className="font-tan-angleton text-3xl md:text-4xl font-bold leading-none text-white">
                PPIA <span className="text-[#FEB602]">Queensland</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#FEB602] font-bold mt-2">
                Brisbane Chapter • Est. 1988
              </p>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm italic font-medium">
              {language === 'id'
                ? 'Menghubungkan komunitas pelajar Indonesia di Queensland melalui semangat kebersamaan dan kekayaan budaya.'
                : 'Connecting the Indonesian student community across Queensland through the spirit of togetherness and cultural richness.'}
            </p>
            
            {/* Social Pill Links */}
            <div className="flex gap-3 pt-2">
              {['Instagram', 'Facebook'].map((platform) => (
                <a
                  key={platform}
                  href={`https://${platform.toLowerCase()}.com/ppiaqueensland`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-white/10 text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-[#FEB602] hover:text-[#B64847] hover:border-[#FEB602] transition-all duration-300"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* --- NAVIGATION --- */}
          <div className="md:col-span-3">
            <h3 className="text-[#FEB602] text-xs font-bold uppercase tracking-[0.3em] mb-8 border-l-2 border-[#B64847] pl-3">
              {language === 'id' ? 'Eksplorasi' : 'Explore'}
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: translations.navigation.home, href: '/' },
                { label: translations.navigation.about, href: '/about' },
                { label: translations.navigation.membership, href: '/membership' },
                { label: translations.navigation.pestaRakyat, href: '/pesta-rakyat' },
                { label: translations.navigation.contact, href: '/contact' },
              ].map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="text-white/40 hover:text-white text-sm transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="w-0 h-px bg-[#FEB602] transition-all duration-300 group-hover:w-4"></span>
                  {getTranslation(item.label, language)}
                </Link>
              ))}
            </div>
          </div>

          {/* --- INFO --- */}
          <div className="md:col-span-4">
            <h3 className="text-[#FEB602] text-xs font-bold uppercase tracking-[0.3em] mb-8 border-l-2 border-[#B64847] pl-3">
              {language === 'id' ? 'Info Kontak' : 'Contact Info'}
            </h3>
            <div className="space-y-6">
              <div className="group cursor-pointer">
                <p className="text-white/30 text-[9px] uppercase font-bold tracking-widest mb-1">Email</p>
                <p className="text-white group-hover:text-[#FEB602] transition-colors font-medium">info@ppiaq.org</p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-white/30 text-[9px] uppercase font-bold tracking-widest mb-1">Location</p>
                <p className="text-white leading-relaxed font-medium">Queensland, Australia</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-medium text-center md:text-left">
            <p>{getTranslation(translations.footer.copyright, language)}</p>
          </div>
          
          <div className="opacity-20 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0">
             <div className="w-10 h-10 border border-dashed border-[#FEB602] rounded-full flex items-center justify-center text-[7px] text-[#FEB602] font-bold rotate-12">
               PPIAQ
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}