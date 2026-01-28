'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  membershipType: 'ordinary' | 'associate';
  university: string;
}

const UNIVERSITIES = [
  'University of Queensland',
  'Griffith University',
  'James Cook University',
  'Queensland University of Technology',
];

export default function RegisterPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      id: 'personal',
      title: translations.auth.register.step1.title,
      fields: [
        { name: 'firstName', label: translations.auth.register.step1.firstName, type: 'text' },
        { name: 'lastName', label: translations.auth.register.step1.lastName, type: 'text' },
        { name: 'email', label: translations.auth.register.step1.email, type: 'email' },
      ],
    },
    {
      id: 'account',
      title: translations.auth.register.step2.title,
      fields: [
        { name: 'username', label: translations.auth.register.step2.username, type: 'text' },
        { name: 'password', label: translations.auth.register.step2.password, type: 'password' },
        { name: 'confirmPassword', label: translations.auth.register.step2.confirmPassword, type: 'password' },
      ],
    },
    {
      id: 'membership',
      title: translations.auth.register.step3.title,
    },
  ];

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (): boolean => {
    setError('');

    if (step === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError(language === 'id' ? 'Semua field harus diisi' : 'All fields are required');
        return false;
      }
      if (!formData.email?.includes('@')) {
        setError(language === 'id' ? 'Email tidak valid' : 'Invalid email');
        return false;
      }
    } else if (step === 1) {
      if (!formData.username || !formData.password || !formData.confirmPassword) {
        setError(language === 'id' ? 'Semua field harus diisi' : 'All fields are required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(language === 'id' ? 'Kata sandi tidak cocok' : 'Passwords do not match');
        return false;
      }
      if ((formData.password?.length || 0) < 8) {
        setError(language === 'id' ? 'Kata sandi minimal 8 karakter' : 'Password must be at least 8 characters');
        return false;
      }
    } else if (step === 2) {
      if (!formData.membershipType || !formData.university) {
        setError(language === 'id' ? 'Semua field harus diisi' : 'All fields are required');
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Submit form
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            username: formData.username,
            password: formData.password,
            membershipType: formData.membershipType,
            university: formData.university,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registration failed');
          return;
        }

        setIsComplete(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setError('');
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        {!isComplete ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {language === 'id' ? 'Langkah' : 'Step'} {step + 1} {language === 'id' ? 'dari' : 'of'} {steps.length}
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mb-8">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? 'bg-blue-600 text-white'
                        : i === step
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Title and Error */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {getTranslation(steps[step].title, language)}
              </h2>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Form Content */}
            {step === 0 || step === 1 ? (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {steps[step].fields?.map((field: any) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700">
                      {getTranslation(field.label, language)}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof FormData] || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.name}
                    />
                  </div>
                ))}
              </form>
            ) : (
              <div className="space-y-4">
                {/* Membership Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation(translations.auth.register.step3.membershipType, language)}
                  </label>
                  <select
                    name="membershipType"
                    value={formData.membershipType || ''}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {language === 'id' ? 'Pilih jenis' : 'Select type'}
                    </option>
                    <option value="ordinary">
                      {getTranslation(translations.auth.register.step3.ordinary, language)} (ID)
                    </option>
                    <option value="associate">
                      {getTranslation(translations.auth.register.step3.associate, language)} (Non-ID)
                    </option>
                  </select>
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation(translations.auth.register.step3.university, language)}
                  </label>
                  <select
                    name="university"
                    value={formData.university || ''}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {language === 'id' ? 'Pilih universitas' : 'Select university'}
                    </option>
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-6">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {language === 'id' ? 'Kembali' : 'Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading
                  ? language === 'id'
                    ? 'Sedang...'
                    : 'Loading...'
                  : step === steps.length - 1
                  ? getTranslation(translations.auth.register.submit, language)
                  : language === 'id'
                  ? 'Selanjutnya'
                  : 'Next'}
              </button>
            </div>
          </>
        ) : (
          // Success Message
          <div className="text-center py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getTranslation(translations.auth.register.success, language)}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'id'
                ? 'Terima kasih atas pendaftaran Anda. Silakan masuk.'
                : 'Thank you for registering. Please sign in.'}
            </p>
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {getTranslation(translations.navigation.login, language)}
            </Link>
          </div>
        )}

        {/* Login Link */}
        {!isComplete && (
          <div className="text-center text-sm">
            <span className="text-gray-600">
              {getTranslation(translations.auth.register.alreadyHave, language)}{' '}
            </span>
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {getTranslation(translations.auth.register.login, language)}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
