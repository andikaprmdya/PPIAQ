'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';

export default function FAQSection() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: language === 'id' ? 'Apa saja keuntungan keanggotaan?' : 'What are the membership benefits?',
      answer: language === 'id'
        ? 'Anggota mendapatkan harga eksklusif untuk acara, akses awal ke program, dan akses penuh ke papan komunitas.'
        : 'Members receive exclusive event prices, early access to programs, and full access to the community board.'
    },
    {
      question: language === 'id' ? 'Siapa yang bisa menjadi anggota?' : 'Who can become a member?',
      answer: language === 'id'
        ? 'Pelajar Indonesia atau mereka dengan warisan Indonesia yang belajar di Queensland dapat menjadi anggota biasa atau asosiasi.'
        : 'Indonesian students or those with Indonesian heritage studying in Queensland can join as ordinary or associate members.'
    },
    {
      question: language === 'id' ? 'Berapa biaya keanggotaan?' : 'How much does membership cost?',
      answer: language === 'id'
        ? 'Keanggotaan hanya $10 AUD per tahun untuk kedua jenis keanggotaan.'
        : 'Membership is only $10 AUD per year for both membership types.'
    },
    {
      question: language === 'id' ? 'Bagaimana cara mendaftar?' : 'How do I register?',
      answer: language === 'id'
        ? 'Klik tombol "Daftar" dan ikuti proses pendaftaran multi-langkah kami yang mudah.'
        : 'Click the "Sign Up" button and follow our easy multi-step registration process.'
    },
    {
      question: language === 'id' ? 'Apa itu Pesta Rakyat?' : 'What is Pesta Rakyat?',
      answer: language === 'id'
        ? 'Pesta Rakyat adalah perayaan Hari Kemerdekaan Indonesia terbesar di Queensland dengan musik, makanan, dan acara budaya.'
        : 'Pesta Rakyat is Queensland\'s largest Indonesian Independence Day celebration featuring music, food, and cultural events.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'id' ? 'Pertanyaan Umum' : 'Frequently Asked Questions'}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                <span className={`text-2xl text-blue-600 transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
