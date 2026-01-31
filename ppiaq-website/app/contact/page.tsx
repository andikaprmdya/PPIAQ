'use client';

import { useLanguage } from '@/lib/language-context';

export default function ContactPage() {
  const { language } = useLanguage();

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen relative overflow-hidden flex flex-col">
      
      {/* --- NO SPACER (Content starts immediately) --- */}

      {/* --- DECORATIVE ELEMENTS --- */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-[#FEB602]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* --- HERO SECTION (Minimalist Top Padding) --- */}
      <section className="pt-2 md:pt-4 pb-4 px-6 text-center relative z-10">
        <p className="font-nickainley text-xl md:text-2xl text-[#886644] mb-1">
          {language === 'id' ? 'Mari Terhubung' : 'Get in touch'}
        </p>
        <h1 className="font-tan-angleton font-bold text-4xl md:text-6xl text-[#B64847] uppercase tracking-tighter leading-none">
          Contact Us
        </h1>
        <div className="w-10 h-1 bg-[#FEB602] mx-auto rounded-full mt-2"></div>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <section className="max-w-6xl mx-auto px-6 pb-16 w-full relative z-10 grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* --- LEFT: SEND US A MESSAGE --- */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[3rem] border border-[#E4DBCA] shadow-2xl shadow-[#B64847]/5 flex flex-col justify-center">
            <div className="mb-8 md:mb-10">
              <h2 className="font-tan-angleton font-bold text-3xl md:text-4xl text-[#B64847] leading-tight mb-2">
                Send us a message
              </h2>
              <div className="h-1 w-16 bg-[#FEB602] rounded-full"></div>
            </div>
            
            <form className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">First Name *</label>
                  <input type="text" className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium" />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">Last Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium" />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">Email Address *</label>
                <input type="email" className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium" />
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">Message *</label>
                <textarea rows={2} className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all resize-none text-sm font-medium"></textarea>
              </div>

              <div className="pt-2">
                <button className="bg-[#B64847] text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-[#303030] transition-all active:scale-95 shadow-[#B64847]/10">
                  Submit Message
                </button>
              </div>
            </form>
          </div>

          {/* --- RIGHT: INFO & NEWSLETTER --- */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Email and Social Media Card */}
            <div className="bg-[#B64847] text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex justify-between items-center group shrink-0">
               <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]"></div>

               <div className="relative z-10 space-y-5 flex-1">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#FEB602] mb-1 block">Direct Reach</span>
                    <h3 className="font-tan-angleton font-bold text-2xl mb-1 leading-tight text-white">Email and <br/>Social Media</h3>
                    <div className="w-10 h-0.5 bg-[#FEB602]/40 mt-2"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col">
                       <p className="text-[8px] font-bold uppercase tracking-widest text-[#FEB602]/80">Official Inquiry</p>
                       <p className="text-sm font-medium">info@ppiaq.org</p>
                    </div>
                    <div className="flex flex-col">
                       <p className="text-[8px] font-bold uppercase tracking-widest text-[#FEB602]/80">Current Base</p>
                       <p className="text-sm font-medium uppercase tracking-tighter">Queensland, Australia</p>
                    </div>
                  </div>
               </div>
               
               {/* VERTICAL SOCIAL LOGOS */}
               <div className="relative z-10 flex flex-col gap-3 pl-6 border-l border-white/10">
                  {[
                    { name: 'IG', icon: '📱' },
                    { name: 'FB', icon: '👥' },
                    { name: 'LI', icon: '🔗' }
                  ].map((social) => (
                    <a 
                      key={social.name}
                      href="#" 
                      className="w-10 h-10 rounded-2xl border border-white/20 flex items-center justify-center bg-white/5 hover:bg-[#FEB602] hover:text-[#B64847] hover:-translate-x-1 transition-all duration-300 shadow-lg"
                    >
                      <span className="text-base">{social.icon}</span>
                    </a>
                  ))}
               </div>
            </div>

            {/* Stay Informed Card */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-[#E4DBCA] shadow-sm relative overflow-hidden flex-1 flex flex-col justify-center">
               <div className="relative z-10">
                 <h3 className="font-tan-angleton font-bold text-2xl text-[#B64847] mb-2 tracking-wide">Stay informed</h3>
                 <p className="text-[11px] text-gray-500 mb-6 italic leading-relaxed max-w-60">
                   Subscribe to receive community updates and opportunities.
                 </p>
                 
                 <form className="space-y-4">
                   <input 
                     type="email" 
                     placeholder="Professional Email" 
                     className="w-full bg-[#FFFAF5] border border-[#E4DBCA] px-5 py-4 rounded-2xl focus:outline-none focus:border-[#B64847] transition-all text-xs font-medium" 
                   />
                   <button className="w-full bg-[#303030] text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] hover:bg-[#B64847] transition-all active:scale-95 shadow-lg">
                     Join Newsletter
                   </button>
                 </form>
               </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* Footer Seamless Accent */}
      <div className="h-1.5 bg-[#FEB602] w-full mt-auto"></div>
    </main>
  );
}