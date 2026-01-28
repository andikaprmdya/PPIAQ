'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(getTranslation(translations.contact.form.success, language));
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setMessage(language === 'id' ? 'Terjadi kesalahan. Coba lagi.' : 'An error occurred. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {getTranslation(translations.contact.title, language)}
          </h1>
          <p className="text-xl text-blue-100">
            {language === 'id'
              ? 'Kami senang mendengar dari Anda. Hubungi kami untuk pertanyaan atau feedback.'
              : 'We would love to hear from you. Contact us for any questions or feedback.'}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg">
                {language === 'id' ? 'Informasi Kontak' : 'Contact Information'}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    {language === 'id' ? 'Email' : 'Email'}
                  </h3>
                  <a href="mailto:info@ppiaq.org" className="text-blue-600 hover:text-blue-800">
                    info@ppiaq.org
                  </a>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    {language === 'id' ? 'Lokasi' : 'Location'}
                  </h3>
                  <p className="text-gray-700">Queensland, Australia</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    {language === 'id' ? 'Media Sosial' : 'Social Media'}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://instagram.com/ppiaqueensland"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 flex items-center gap-2"
                    >
                      📱 Instagram: @ppiaqueensland
                    </a>
                    <a
                      href="https://facebook.com/ppiaqueensland"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 flex items-center gap-2"
                    >
                      f Facebook: PPIA Queensland
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {language === 'id' ? 'Jam Operasional' : 'Business Hours'}
                  </h3>
                  <p className="text-blue-100 text-lg">
                    {language === 'id'
                      ? 'Kami tersedia untuk pertanyaan melalui email dan media sosial. Respon biasanya dalam 24 jam kerja.'
                      : 'We are available for inquiries via email and social media. Response is typically within 24 business hours.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-lg">
                {language === 'id' ? 'Kirim Pesan' : 'Send a Message'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation(translations.contact.form.name, language)}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder={language === 'id' ? 'Nama Anda' : 'Your Name'}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation(translations.contact.form.email, language)}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation(translations.contact.form.message, language)}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder={language === 'id' ? 'Pesan Anda' : 'Your Message'}
                  />
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-4 rounded-lg ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
                >
                  {isLoading
                    ? language === 'id'
                      ? 'Mengirim...'
                      : 'Sending...'
                    : getTranslation(translations.contact.form.submit, language)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
