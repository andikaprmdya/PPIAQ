'use client';

import { useLanguage } from '@/lib/language-context';

const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfLYRGehHPtTOmimjV7IFRcQuByqYq5upmIMXQI-f5HvV5K8A/viewform';

export default function ElectionForm() {
  const { language } = useLanguage();
  const isIndonesian = language === 'id';

  return (
    <section className="min-h-screen bg-[#FFFAF5] px-3 py-10 text-[#303030] sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-tan-angleton text-3xl font-bold text-[#B64847] sm:text-4xl">
            {isIndonesian ? 'Pemilihan PPIAQ 2026' : 'PPIAQ 2026 Election'}
          </h1>
          <p className="mt-4">
            {isIndonesian
              ? 'Silakan isi formulir pemilihan di bawah ini.'
              : 'Please complete the election form below.'}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed">
            {isIndonesian
              ? 'Google Form ini memerlukan login akun Google. Jika formulir tidak tampil atau login terkendala, buka langsung melalui tombol berikut.'
              : 'This form requires a Google Account sign-in. If the form does not appear or you have trouble signing in, open it directly using the button below.'}
          </p>
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-xl bg-[#B64847] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#963B3A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B64847]"
          >
            {isIndonesian ? 'Buka Google Form' : 'Open Google Form'}
          </a>
        </div>
        <iframe
          src={`${formUrl}?embedded=true`}
          title={isIndonesian ? 'Formulir Pemilihan PPIAQ 2026' : 'PPIAQ 2026 Election Form'}
          className="h-[80dvh] min-h-[650px] w-full rounded-2xl border border-[#E4DBCA] bg-white"
        />
      </div>
    </section>
  );
}
