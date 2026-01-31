'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';
import { useState, useEffect } from 'react';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: translations.navigation.home, href: '/' },
    { label: translations.navigation.about, href: '/about' },
    { label: translations.navigation.membership, href: '/membership' },
    { label: translations.navigation.pestaRakyat, href: '/pesta-rakyat' },
    { label: translations.navigation.contact, href: '/contact' },
  ];

  return (
    <>
      {/* --- SPACER (RAPAT) --- */}
      <div className="h-16 md:h-20 bg-[#FFFAF5]"></div>

      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 group/nav ${
          isScrolled 
            ? 'bg-[#FFFAF5]/95 backdrop-blur-md py-2 shadow-md' 
            : 'bg-[#FFFAF5] py-4'
        } hover:bg-[#B64847] hover:shadow-2xl`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center h-12">
            
            {/* --- LOGO --- */}
            <Link href="/" className="flex flex-col justify-center shrink-0 group/logo">
              <span className="font-tan-angleton text-2xl md:text-3xl font-bold text-[#B64847] transition-colors duration-300 group-hover/nav:text-white group-hover/logo:!text-[#FEB602]">
                PPIA Queensland
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#FEB602] font-bold mt-1 transition-colors duration-300 group-hover/nav:text-white/60">
                Brisbane Chapter
              </span>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            <div className="hidden lg:flex gap-8 items-center h-full">
              {navItems.map((item) => (
                <Link
                  key={getTranslation(item.label, language)}
                  href={item.href}
                  className="relative text-[13px] font-bold uppercase tracking-widest text-[#303030] transition-all duration-300 py-2 group-hover/nav:text-white/90 hover:!text-[#FEB602] hover:scale-110 active:scale-95 group/item"
                >
                  {getTranslation(item.label, language)}
                  
                  {/* Underline: Hanya muncul saat ITEM ini di-hover, bukan saat NAV di-hover */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FEB602] transition-all duration-300 group-hover/item:w-full"></span>
                </Link>
              ))}
            </div>

            {/* --- RIGHT ACTIONS --- */}
            <div className="flex gap-6 items-center h-full">
              
              {/* Language Switcher */}
              <div className="hidden sm:flex relative bg-[#E4DBCA]/40 rounded-full p-1 w-[80px] h-9 items-center overflow-hidden border border-[#E4DBCA] transition-colors duration-500 group-hover/nav:border-white/20 group-hover/nav:bg-white/10">
                <div 
                  className={`absolute h-7 w-[36px] bg-[#B64847] rounded-full transition-all duration-300 ease-in-out ${
                    language === 'en' ? 'translate-x-0' : 'translate-x-[36px]'
                  } group-hover/nav:bg-[#FEB602]`}
                />
                <button
                  onClick={() => setLanguage('en')}
                  className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${language === 'en' ? 'text-white group-hover/nav:text-[#B64847]' : 'text-[#886644] group-hover/nav:text-white/60'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`relative z-10 flex-1 text-[10px] font-black transition-colors duration-300 ${language === 'id' ? 'text-white group-hover/nav:text-[#B64847]' : 'text-[#886644] group-hover/nav:text-white/60'}`}
                >
                  ID
                </button>
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-5">
                <Link
                  href="/auth/login"
                  className="text-[12px] font-bold uppercase tracking-widest text-[#303030] transition-colors duration-300 group-hover/nav:text-white hover:!text-[#FEB602] hover:scale-110"
                >
                  {getTranslation(translations.navigation.login, language)}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#B64847] text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 group-hover/nav:bg-white group-hover/nav:text-[#B64847] hover:!bg-[#FEB602] hover:!text-[#B64847] hover:scale-105"
                >
                  {getTranslation(translations.navigation.register, language)}
                </Link>
              </div>

              {/* Mobile Menu Icon */}
              <button
                className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className={`h-0.5 transition-all duration-300 ${isMenuOpen ? 'w-8 rotate-45 translate-y-2' : 'w-6'} ${isMenuOpen ? 'bg-white' : 'bg-[#B64847] group-hover/nav:bg-white'}`}></span>
                <span className={`w-8 h-0.5 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'} ${isMenuOpen ? 'bg-white' : 'bg-[#B64847] group-hover/nav:bg-white'}`}></span>
                <span className={`h-0.5 transition-all duration-300 ${isMenuOpen ? 'w-8 -rotate-45 -translate-y-2' : 'w-4'} ${isMenuOpen ? 'bg-white' : 'bg-[#B64847] group-hover/nav:bg-white'}`}></span>
              </button>
            </div>
          </div>

          {/* --- MOBILE OVERLAY --- */}
          <div className={`lg:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100 pb-10' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="flex flex-col gap-6 mt-8 border-t border-white/20 pt-8">
              {navItems.map((item) => (
                <Link
                  key={getTranslation(item.label, language)}
                  href={item.href}
                  className="text-lg font-bold uppercase tracking-[0.2em] text-[#303030] transition-colors duration-300 group-hover/nav:text-white hover:!text-[#FEB602]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getTranslation(item.label, language)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}