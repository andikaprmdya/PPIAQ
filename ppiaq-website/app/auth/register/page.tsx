'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import {
  ASSOCIATE_NATIONALITY_OPTIONS,
  ORDINARY_NATIONALITY,
} from '@/lib/countries';

interface FormData {
  // Step 1: Personal
  firstName: string;
  lastName: string;
  nationality: string;
  birthDate: string;
  phoneNumber: string;
  studentId: string;

  // Step 2: Education
  educationLevel: string;
  university: string;
  otherUniversity: string;
  major: string;
  expectedGraduationDate: string;

  // Step 3: Account & Payment
  email: string;
  password: string;
  confirmPassword: string;
  membershipType: 'ordinary' | 'associate';
  paymentProofFile: File | null;
}

const UNIVERSITIES = [
  'University of Queensland',
  'Griffith University',
  'James Cook University',
  'Queensland University of Technology',
  'Other',
];

const EDUCATION_LEVELS = ['Diploma', 'S1 (Bachelor)', 'S2 (Master)', 'S3 (Doctorate)', 'Postdoctoral'];

export default function RegisterPage() {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [agreeAssociateLimits, setAgreeAssociateLimits] = useState(false);
  const [agreeDataUsage, setAgreeDataUsage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    nationality: ORDINARY_NATIONALITY,
    birthDate: '',
    phoneNumber: '',
    studentId: '',
    educationLevel: '',
    university: '',
    otherUniversity: '',
    major: '',
    expectedGraduationDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    membershipType: 'ordinary',
    paymentProofFile: null,
  });

  useEffect(() => {
    const typeFromQuery = new URLSearchParams(window.location.search).get('membershipType');
    if (typeFromQuery === 'ordinary' || typeFromQuery === 'associate') {
      setFormData((prev) => ({
        ...prev,
        membershipType: typeFromQuery,
        nationality: typeFromQuery === 'ordinary'
          ? ORDINARY_NATIONALITY
          : prev.nationality === ORDINARY_NATIONALITY
            ? ''
            : prev.nationality,
      }));
      if (typeFromQuery === 'ordinary') {
        setAgreeAssociateLimits(false);
      }
    }
  }, []);

  // Track if Rubric link was clicked for UQ, QUT, Griffith, JCU
  const [rubricLinkClicked, setRubricLinkClicked] = useState(false);

  const steps = [
    {
      id: 'personal',
      title: language === 'id' ? 'Informasi Pribadi' : 'Personal Information',
      description: language === 'id' ? 'Mulai dengan data dasar Anda' : 'Start with your basic information',
    },
    {
      id: 'education',
      title: language === 'id' ? 'Informasi Pendidikan' : 'Educational Information',
      description: language === 'id' ? 'Berikan detail pendidikan Anda' : 'Provide your education details',
    },
    {
      id: 'account',
      title: language === 'id' ? 'Akun & Bukti Pembayaran' : 'Account & Payment Proof',
      description: language === 'id' ? 'Lengkapi akun dan upload bukti' : 'Complete your account and upload proof',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'membershipType') {
      const nextMembershipType = value as FormData['membershipType'];
      setFormData((prev) => ({
        ...prev,
        membershipType: nextMembershipType,
        nationality: nextMembershipType === 'ordinary'
          ? ORDINARY_NATIONALITY
          : prev.nationality === ORDINARY_NATIONALITY
            ? ''
            : prev.nationality,
      }));

      if (nextMembershipType === 'ordinary') {
        setAgreeAssociateLimits(false);
      }

      return;
    }

    if (name === 'nationality') {
      setFormData((prev) => ({
        ...prev,
        nationality: prev.membershipType === 'ordinary' ? ORDINARY_NATIONALITY : value,
      }));
      return;
    }

    if (name === 'university') {
      setRubricLinkClicked(false);
      setFormData((prev) => ({
        ...prev,
        university: value,
        otherUniversity: value === 'Other' ? prev.otherUniversity : '',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError(language === 'id' ? 'Format file harus JPEG, JPG, atau PNG' : 'File must be JPEG, JPG, or PNG');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(language === 'id' ? 'Ukuran file maksimal 5MB' : 'File size must not exceed 5MB');
        return;
      }

      setFormData((prev) => ({ ...prev, paymentProofFile: file }));
      setError('');
    }
  };

  const validateStep = (): boolean => {
    setError('');

    if (currentStep === 0) {
      // Validate personal info
      if (!formData.firstName.trim()) {
        setError(language === 'id' ? 'Nama depan harus diisi' : 'First name is required');
        return false;
      }
      if (!formData.lastName.trim()) {
        setError(language === 'id' ? 'Nama belakang harus diisi' : 'Last name is required');
        return false;
      }
      if (!formData.nationality) {
        setError(language === 'id' ? 'Kewarganegaraan harus dipilih' : 'Nationality is required');
        return false;
      }
      if (formData.membershipType === 'ordinary' && formData.nationality !== ORDINARY_NATIONALITY) {
        setError(language === 'id'
          ? 'Keanggotaan biasa hanya untuk kewarganegaraan Indonesia'
          : 'Ordinary membership is only for Indonesian nationality');
        return false;
      }
      if (formData.membershipType === 'associate' && formData.nationality === ORDINARY_NATIONALITY) {
        setError(language === 'id'
          ? 'Keanggotaan asosiasi harus menggunakan kewarganegaraan non-Indonesia'
          : 'Associate membership must use non-Indonesian nationality');
        return false;
      }
      if (!formData.birthDate) {
        setError(language === 'id' ? 'Tanggal lahir harus diisi' : 'Birth date is required');
        return false;
      }
    } else if (currentStep === 1) {
      // Validate education info
      if (!formData.educationLevel) {
        setError(language === 'id' ? 'Jenjang pendidikan harus dipilih' : 'Education level is required');
        return false;
      }
      if (!formData.university) {
        setError(language === 'id' ? 'Universitas harus dipilih' : 'University is required');
        return false;
      }
      if (formData.university === 'Other' && !formData.otherUniversity.trim()) {
        setError(
          language === 'id'
            ? 'Nama universitas harus diisi jika memilih Other'
            : 'University name is required when selecting Other'
        );
        return false;
      }
      if (!formData.major.trim()) {
        setError(language === 'id' ? 'Jurusan harus diisi' : 'Major is required');
        return false;
      }
      if (!formData.expectedGraduationDate) {
        setError(language === 'id' ? 'Tanggal perkiraan kelulusan harus diisi' : 'Expected graduation date is required');
        return false;
      }
      // Check if Rubric link was clicked for UQ, QUT, Griffith, JCU
      const rubricUniversities = ['University of Queensland', 'Queensland University of Technology', 'Griffith University', 'James Cook University'];
      if (rubricUniversities.includes(formData.university) && !rubricLinkClicked) {
        setError(language === 'id'
          ? 'Silakan klik link Rubric untuk menyelesaikan pendaftaran universitas Anda'
          : 'Please click the Rubric link to complete your university registration');
        return false;
      }
    } else if (currentStep === 2) {
      // Validate account & payment
      if (!formData.email.trim()) {
        setError(language === 'id' ? 'Email harus diisi' : 'Email is required');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(language === 'id' ? 'Format email tidak valid' : 'Invalid email format');
        return false;
      }
      if (!formData.password) {
        setError(language === 'id' ? 'Kata sandi harus diisi' : 'Password is required');
        return false;
      }
      if (formData.password.length < 6) {
        setError(language === 'id' ? 'Kata sandi minimal 6 karakter' : 'Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(language === 'id' ? 'Kata sandi tidak cocok' : 'Passwords do not match');
        return false;
      }
      if (!formData.paymentProofFile) {
        setError(language === 'id' ? 'Bukti pembayaran harus diunggah' : 'Payment proof must be uploaded');
        return false;
      }
      if (formData.membershipType === 'ordinary' && formData.nationality !== ORDINARY_NATIONALITY) {
        setError(language === 'id'
          ? 'Keanggotaan biasa hanya untuk kewarganegaraan Indonesia'
          : 'Ordinary membership is only for Indonesian nationality');
        return false;
      }
      if (formData.membershipType === 'associate' && !formData.nationality) {
        setError(language === 'id'
          ? 'Untuk keanggotaan asosiasi, kembali ke langkah sebelumnya dan pilih kewarganegaraan'
          : 'For associate membership, go back to the previous step and select nationality');
        return false;
      }
      if (formData.membershipType === 'associate' && formData.nationality === ORDINARY_NATIONALITY) {
        setError(language === 'id'
          ? 'Keanggotaan asosiasi harus menggunakan kewarganegaraan non-Indonesia'
          : 'Associate membership must use non-Indonesian nationality');
        return false;
      }
      if (formData.membershipType === 'associate' && !agreeAssociateLimits) {
        setError(language === 'id'
          ? 'Anda harus menyetujui batasan hak Associate/Non-Indonesian member'
          : 'You must agree to the Associate/Non-Indonesian membership limitations');
        return false;
      }
      if (!agreeDataUsage) {
        setError(language === 'id'
          ? 'Anda harus menyetujui penggunaan data untuk keadaan darurat dan pemasaran'
          : 'You must agree to data use for emergency and marketing purposes');
        return false;
      }
    }

    return true;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('Failed to convert file');
        }
      };
      reader.onerror = () => reject('Failed to read file');
    });
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      setIsLoading(true);
      try {
        const finalUniversity =
          formData.university === 'Other'
            ? formData.otherUniversity.trim()
            : formData.university;

        // Convert file to base64
        let paymentProofUrl = '';
        if (formData.paymentProofFile) {
          paymentProofUrl = await convertFileToBase64(formData.paymentProofFile);
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            password: formData.password,
            nationality: formData.nationality,
            educationLevel: formData.educationLevel,
            university: finalUniversity,
            major: formData.major.trim(),
            expectedGraduationDate: formData.expectedGraduationDate,
            birthDate: formData.birthDate,
            phoneNumber: formData.phoneNumber.trim(),
            studentId: formData.studentId.trim(),
            membershipType: formData.membershipType,
            paymentProofUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || (language === 'id' ? 'Pendaftaran gagal' : 'Registration failed'));
          return;
        }

        setIsComplete(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        setError(language === 'id' ? 'Terjadi kesalahan jaringan' : 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const availableNationalities = formData.membershipType === 'ordinary'
    ? [ORDINARY_NATIONALITY]
    : [...ASSOCIATE_NATIONALITY_OPTIONS];

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        {!isComplete ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <p className="font-nickainley text-2xl text-[#886644] mb-2">
                {language === 'id' ? 'Bergabung dengan komunitas' : 'Join our community'}
              </p>
              <h1 className="font-tan-angleton font-bold text-4xl md:text-5xl text-[#B64847] uppercase tracking-tighter mb-4">
                {language === 'id' ? 'Daftar Sekarang' : 'Register Now'}
              </h1>
              <div className="w-12 h-1 bg-[#FEB602] mx-auto rounded-full"></div>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-sm uppercase tracking-widest text-[#886644]">
                  {language === 'id' ? 'Langkah' : 'Step'} {currentStep + 1} {language === 'id' ? 'dari' : 'of'} {steps.length}
                </span>
                <span className="font-bold text-sm uppercase tracking-widest text-[#B64847]">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-[#E4DBCA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B64847] transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mb-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all mb-2 ${
                      index < currentStep
                        ? 'bg-[#B64847] text-white ring-2 ring-[#FEB602]'
                        : index === currentStep
                        ? 'bg-[#B64847] text-white ring-2 ring-[#FEB602] scale-110'
                        : 'bg-[#E4DBCA] text-[#886644]'
                    }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center text-[#886644]">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#E4DBCA] shadow-lg mb-8">
              {/* Step Title */}
              <div className="mb-8">
                <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-sm">{steps[currentStep].description}</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              )}

              {/* Step 0: Personal Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                        {language === 'id' ? 'Nama Depan' : 'First Name'} *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                        placeholder={language === 'id' ? 'Nama depan' : 'First name'}
                      />
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                        {language === 'id' ? 'Nama Belakang' : 'Last Name'} *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                        placeholder={language === 'id' ? 'Nama belakang' : 'Last name'}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Kewarganegaraan' : 'Nationality'} *
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="">{language === 'id' ? 'Pilih kewarganegaraan' : 'Select nationality'}</option>
                      {availableNationalities.map((nat) => (
                        <option key={nat} value={nat}>
                          {nat}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-[11px] text-[#886644]">
                      {formData.membershipType === 'ordinary'
                        ? (language === 'id'
                            ? 'Untuk anggota biasa, kewarganegaraan dikunci ke Indonesia.'
                            : 'For ordinary members, nationality is fixed to Indonesia.')
                        : (language === 'id'
                            ? 'Untuk anggota asosiasi, pilih kewarganegaraan selain Indonesia (tersedia semua negara + Other).'
                            : 'For associate members, choose any non-Indonesian nationality (all countries + Other are available).')}
                    </p>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Tanggal Lahir' : 'Date of Birth'} *
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                        {language === 'id' ? 'Nomor Telepon' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                        placeholder={language === 'id' ? 'Nomor telepon' : 'Phone number'}
                      />
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                        {language === 'id' ? 'ID Mahasiswa' : 'Student ID'}
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                        placeholder={language === 'id' ? 'ID Mahasiswa' : 'Student ID'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Education Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Jenjang Pendidikan' : 'Education Level'} *
                    </label>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="">{language === 'id' ? 'Pilih jenjang' : 'Select level'}</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Universitas' : 'University'} *
                    </label>
                    <select
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="">{language === 'id' ? 'Pilih universitas' : 'Select university'}</option>
                      {UNIVERSITIES.map((uni) => (
                        <option key={uni} value={uni}>
                          {uni}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.university === 'Other' && (
                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                        {language === 'id' ? 'Nama Universitas' : 'University Name'} *
                      </label>
                      <input
                        type="text"
                        name="otherUniversity"
                        value={formData.otherUniversity}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                        placeholder={language === 'id' ? 'Tulis nama universitas Anda' : 'Type your university name'}
                      />
                    </div>
                  )}

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Jurusan' : 'Major'} *
                    </label>
                    <input
                      type="text"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                      placeholder={language === 'id' ? 'Jurusan' : 'Your major'}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Tanggal Perkiraan Kelulusan' : 'Expected Graduation Date'} *
                    </label>
                    <input
                      type="date"
                      name="expectedGraduationDate"
                      value={formData.expectedGraduationDate}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                    />
                  </div>

                  {/* University-specific registration link */}
                  {['University of Queensland', 'Queensland University of Technology', 'Griffith University', 'James Cook University'].includes(formData.university) && (() => {
                    const uniConfig: Record<string, { label: string; labelId: string; href: string; isEmail?: boolean }> = {
                      'University of Queensland': {
                        label: '→ Register via UQISA (Rubric)',
                        labelId: '→ Daftar via UQISA (Rubric)',
                        href: 'https://campus.hellorubric.com/?s=6249',
                      },
                      'Queensland University of Technology': {
                        label: '→ Register via ISAQ (Rubric)',
                        labelId: '→ Daftar via ISAQ (Rubric)',
                        href: 'https://campus.hellorubric.com/?s=5241',
                      },
                      'Griffith University': {
                        label: '→ Register via Griffith Campus Groups',
                        labelId: '→ Daftar via Griffith Campus Groups',
                        href: 'https://griffith.campusgroups.com/student_community?club_id=206',
                      },
                      'James Cook University': {
                        label: '→ Send Membership Email to JCUISA',
                        labelId: '→ Kirim Email Keanggotaan ke JCUISA',
                        href: `mailto:ppia.jcu.tc@gmail.com?cc=qld@ppi-australia.org&subject=PPIAQ%20Membership%20Application%20-%20JCU&body=Dear%20JCUISA%20Team%2C%0A%0AI%20would%20like%20to%20apply%20for%20PPIAQ%20membership%20as%20a%20James%20Cook%20University%20student.%0A%0APlease%20find%20my%20details%20below%3A%0AName%3A%20${encodeURIComponent((formData.firstName + ' ' + formData.lastName).trim())}%0AEmail%3A%20${encodeURIComponent(formData.email || '[Your Email]')}%0AStudent%20ID%3A%20${encodeURIComponent(formData.studentId || '[Your Student ID]')}%0AMajor%3A%20${encodeURIComponent(formData.major || '[Your Major]')}%0A%0AThank%20you!`,
                        isEmail: true,
                      },
                    };
                    const config = uniConfig[formData.university];
                    return (
                      <div className="mt-8 p-6 bg-[#FEB602]/10 border border-[#FEB602] rounded-2xl">
                        <p className="text-sm font-semibold text-[#B64847] mb-1">
                          {language === 'id' ? '⚠️ Langkah tambahan diperlukan' : '⚠️ Additional step required'}
                        </p>
                        <p className="text-xs text-gray-600 mb-4">
                          {config.isEmail
                            ? (language === 'id'
                                ? 'Klik tombol di bawah untuk mengirim email keanggotaan ke JCUISA. Email akan terbuka di aplikasi email Anda.'
                                : 'Click below to send your membership email to JCUISA. This will open your email app with a prefilled template.')
                            : (language === 'id'
                                ? 'Klik tombol di bawah untuk menyelesaikan pendaftaran komunitas universitas Anda.'
                                : 'Click below to complete your university community registration.')}
                        </p>
                        <a
                          href={config.href}
                          target={config.isEmail ? '_self' : '_blank'}
                          rel="noopener noreferrer"
                          onClick={() => setRubricLinkClicked(true)}
                          className="inline-block px-6 py-3 bg-[#B64847] text-white rounded-xl font-semibold hover:bg-[#9a3a3e] transition-all text-sm"
                        >
                          {language === 'id' ? config.labelId : config.label}
                        </a>
                        {rubricLinkClicked && (
                          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                            <p className="text-green-800 font-semibold text-sm">
                              ✓ {language === 'id' ? 'Link sudah diklik, lanjutkan pendaftaran' : 'Link clicked, you may continue'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Step 2: Account & Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Alamat Email' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                      placeholder={language === 'id' ? 'Email Anda' : 'your@email.com'}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Kata Sandi' : 'Password'} *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                      placeholder={language === 'id' ? 'Minimal 6 karakter' : 'At least 6 characters'}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'} *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium"
                      placeholder={language === 'id' ? 'Konfirmasi kata sandi' : 'Confirm password'}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Jenis Keanggotaan' : 'Membership Type'} *
                    </label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-[#E4DBCA] py-2 focus:outline-none focus:border-[#B64847] transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="ordinary">
                        {language === 'id' ? 'Anggota Biasa' : 'Ordinary Member'} (Indonesian Students)
                      </option>
                      <option value="associate">
                        {language === 'id' ? 'Anggota Asosiasi' : 'Associate Member'} (Other Students/Supporters)
                      </option>
                    </select>
                  </div>

                  {formData.membershipType === 'associate' && (
                    <div className="rounded-2xl border border-[#FEB602] bg-[#FEB602]/10 p-4">
                      <p className="text-xs text-[#303030] leading-relaxed">
                        For non-Indonesian Citizen: this membership does not come with voting rights. Associate members are not able to run for President, Secretary, or Treasurer positions within PPIA Queensland.
                      </p>
                    </div>
                  )}

                  {formData.membershipType === 'associate' && (
                    <label className="flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                      <input
                        type="checkbox"
                        checked={agreeAssociateLimits}
                        onChange={(e) => setAgreeAssociateLimits(e.target.checked)}
                        className="mt-0.5 accent-[#B64847]"
                      />
                      I understand that Associate/Non-Indonesian membership has no voting rights and cannot run for President, Secretary, or Treasurer positions within PPIA Queensland.
                    </label>
                  )}

                  {formData.membershipType === 'associate' && !formData.nationality && (
                    <p className="text-xs text-[#B64847] font-semibold">
                      {language === 'id'
                        ? 'Silakan kembali ke langkah Informasi Pribadi untuk memilih kewarganegaraan.'
                        : 'Please go back to Personal Information step to choose nationality.'}
                    </p>
                  )}

                  <label className="flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                    <input
                      type="checkbox"
                      checked={agreeDataUsage}
                      onChange={(e) => setAgreeDataUsage(e.target.checked)}
                      className="mt-0.5 accent-[#B64847]"
                    />
                    PPIA Queensland may use your information in case of emergency and for marketing purposes. We will not provide your information to a third party without your concern, or for any of our team&apos;s personal uses.
                  </label>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 group-focus-within:text-[#B64847] transition-colors">
                      {language === 'id' ? 'Bukti Pembayaran' : 'Payment Proof'} (JPEG/JPG/PNG, Max 5MB) *
                    </label>
                    <div className="border-2 border-dashed border-[#E4DBCA] rounded-2xl p-6 text-center hover:border-[#B64847] transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
                        onChange={handleFileChange}
                        className="hidden"
                        id="paymentProof"
                      />
                      <label htmlFor="paymentProof" className="cursor-pointer">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="font-bold text-sm text-[#B64847] mb-1">
                          {formData.paymentProofFile
                            ? formData.paymentProofFile.name
                            : language === 'id'
                            ? 'Klik atau seret file'
                            : 'Click to upload or drag file'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {language === 'id' ? 'Format: JPEG, JPG, PNG | Ukuran maksimal: 5MB' : 'Format: JPEG, JPG, PNG | Max size: 5MB'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1 px-6 py-3 border-2 border-[#B64847] text-[#B64847] font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#B64847] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {language === 'id' ? 'Kembali' : 'Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#303030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? language === 'id'
                    ? 'Sedang...'
                    : 'Loading...'
                  : currentStep === steps.length - 1
                  ? language === 'id'
                    ? 'Daftar'
                    : 'Register'
                  : language === 'id'
                  ? 'Selanjutnya'
                  : 'Next'}
              </button>
            </div>

            {/* Already have account */}
            <div className="text-center mt-8">
              <span className="text-sm text-gray-600">
                {language === 'id' ? 'Sudah punya akun? ' : 'Already have an account? '}
                <Link href="/auth/login" className="text-[#B64847] font-bold hover:underline">
                  {language === 'id' ? 'Masuk di sini' : 'Sign in here'}
                </Link>
              </span>
            </div>
          </>
        ) : (
          // Success Message
          <div className="text-center py-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FEB602]/20 mb-6">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="font-tan-angleton font-bold text-4xl text-[#B64847] mb-4">
              {language === 'id' ? 'Pendaftaran Berhasil!' : 'Registration Successful!'}
            </h2>
            <p className="text-gray-600 mb-2 text-base leading-relaxed max-w-lg mx-auto">
              {language === 'id'
                ? 'Terima kasih telah mendaftar. Aplikasi Anda sedang menunggu persetujuan admin. Anda akan dapat masuk setelah disetujui.'
                : 'Thank you for registering. Your application is pending admin approval. You will be able to sign in after approval.'}
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-[#B64847] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#303030] transition-all"
            >
              {language === 'id' ? 'Ke Halaman Login' : 'Go to Login'}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
