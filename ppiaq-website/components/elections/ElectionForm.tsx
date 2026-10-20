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
              ? 'Isi dan kirim formulir pemilihan langsung di halaman ini.'
              : 'Complete and submit the election form directly on this page.'}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed">
            {isIndonesian
              ? 'Jawaban tersimpan di formulir asli PPIAQ. Tidak perlu login akun Google.'
              : 'Responses are saved to PPIAQ’s original Google Form. No Google Account sign-in is required.'}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed">
            {isIndonesian
              ? 'Tautan resume/CV wajib diisi untuk nominasi diri sendiri. Pastikan panitia memiliki akses untuk melihat dokumen.'
              : 'A CV document link is required when nominating yourself. Please make sure the committee can view the document.'}
          </p>
        </div>
        <iframe
          src={`${formUrl}?embedded=true`}
          title={isIndonesian ? 'Formulir Pemilihan PPIAQ 2026' : 'PPIAQ 2026 Election Form'}
          className="h-[80dvh] min-h-[650px] w-full rounded-2xl border border-[#E4DBCA] bg-white"
        />
        <p className="mt-4 text-center text-sm">
          {isIndonesian ? 'Formulir tidak tampil? ' : 'Having trouble viewing the form? '}
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#B64847] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B64847]"
          >
            {isIndonesian ? 'Buka Google Form' : 'Open Google Form'}
          </a>
        </p>
      </div>
    </section>
  );
}
