'use client';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { isInvalidNameValue } from '@/lib/name-validation';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const INITIAL_NOW = Date.now();

const parseDateValue = (value: string | Date | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const addOneYear = (date: Date): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + 1);
  return result;
};

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.floor(Math.max(milliseconds, 0) / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const EDUCATION_LEVEL_OPTIONS = ['Diploma', 'S1 (Bachelor)', 'S2 (Master)', 'S3 (Doctorate)', 'Postdoctoral'];

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  studentId: string;
  domicileCampus: string;
  nationality: string;
  educationLevel: string;
  university: string;
  major: string;
  intake: string;
  expectedGraduation: string;
  birthDate: string;
};

export default function ProfilePage() {
  const { user, isAuthenticated, refetchUser } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [now, setNow] = useState(INITIAL_NOW);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    studentId: '',
    domicileCampus: '',
    nationality: '',
    educationLevel: '',
    university: '',
    major: '',
    intake: '',
    expectedGraduation: '',
    birthDate: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      studentId: user.studentId || '',
      domicileCampus: user.domicileCampus || '',
      nationality: user.nationality || '',
      educationLevel: user.educationLevel || '',
      university: user.university || '',
      major: user.major || '',
      intake: user.intake || '',
      expectedGraduation: user.expectedGraduation || '',
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
    });
  }, [user]);

  const membershipStart = useMemo(
    () =>
      parseDateValue(user?.dateJoined) ||
      parseDateValue(user?.approvedAt) ||
      parseDateValue(user?.createdAt) ||
      new Date(),
    [user?.dateJoined, user?.approvedAt, user?.createdAt]
  );

  const membershipEnd = useMemo(
    () => parseDateValue(user?.membershipTermEnds) || addOneYear(membershipStart),
    [user?.membershipTermEnds, membershipStart]
  );

  const remainingMs = membershipEnd.getTime() - now;
  const isApprovedMember = user?.status === 'APPROVED';
  const isActiveMember = isApprovedMember && remainingMs > 0;
  const countdown = formatCountdown(Math.abs(remainingMs));
  const displayMemberId = user?.memberNo || (user?.id ? user.id.padStart(6, '0') : '-');
  const membershipTypeLabel =
    user?.membershipType === 'ORDINARY'
      ? language === 'id'
        ? 'Anggota Biasa'
        : 'Ordinary Member'
      : language === 'id'
      ? 'Anggota Asosiasi'
      : 'Associate Member';
  const locale = language === 'id' ? 'id-ID' : 'en-US';
  const expectedGraduationDate = parseDateValue(user?.expectedGraduation);
  const expectedGraduationDisplay = user?.expectedGraduation
    ? (expectedGraduationDate
        ? expectedGraduationDate.toLocaleDateString(locale)
        : user.expectedGraduation)
    : '-';
  const isKnownEducationLevel = EDUCATION_LEVEL_OPTIONS.includes(profileForm.educationLevel);

  const handleProfileInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancelProfileEdit = () => {
    if (!user) return;
    setIsEditingProfile(false);
    setProfileMessage(null);
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      studentId: user.studentId || '',
      domicileCampus: user.domicileCampus || '',
      nationality: user.nationality || '',
      educationLevel: user.educationLevel || '',
      university: user.university || '',
      major: user.major || '',
      intake: user.intake || '',
      expectedGraduation: user.expectedGraduation || '',
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
    });
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    if (isInvalidNameValue(profileForm.firstName) || isInvalidNameValue(profileForm.lastName)) {
      setProfileMessage({
        type: 'error',
        text: language === 'id'
          ? 'Nama depan dan nama belakang tidak boleh menggunakan N/A'
          : 'First name and last name cannot use N/A',
      });
      setIsSavingProfile(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileMessage({
          type: 'error',
          text: data.error || (language === 'id' ? 'Gagal menyimpan profil' : 'Failed to save profile'),
        });
        return;
      }

      await refetchUser();
      setIsEditingProfile(false);
      setProfileMessage({
        type: 'success',
        text: language === 'id' ? 'Profil berhasil diperbarui' : 'Profile updated successfully',
      });
    } catch {
      setProfileMessage({
        type: 'error',
        text: language === 'id' ? 'Terjadi kesalahan saat menyimpan' : 'An error occurred while saving',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="font-nickainley text-2xl text-[#886644] mb-2">
            {language === 'id' ? 'Profil Anda' : 'Your Profile'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl md:text-5xl text-[#B64847] uppercase tracking-tighter mb-4">
            {user.firstName} {user.lastName}
          </h1>
          <div className="w-12 h-1 bg-[#FEB602] rounded-full"></div>
        </div>

        {/* Membership Card */}
        <div className="mb-12">
          <h2 className="font-tan-angleton font-bold text-2xl text-[#B64847] mb-6">
            {language === 'id' ? 'Kartu Anggota' : 'Membership Card'}
          </h2>

          <div className="relative w-full aspect-[2000/1111] text-white shadow-2xl border-2 border-[#FEB602] bg-[#101010] overflow-hidden">
            <img
              src="/images/membership/ppiaq-2026-membership-card-design.png"
              alt="PPIA Queensland membership card background"
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />

            {/* Content area aligned to Y:305-715 and using top-right free space */}
            <div className="absolute left-[4.5%] right-[4.5%] top-[27.5%] h-[36.9%] grid grid-cols-[2.8fr_1fr] gap-[1.2%]">
              <div className="h-full rounded-lg border border-white/15 bg-black/30 px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 backdrop-blur-[1px] flex flex-col justify-between">
                <div>
                  <h3 className="font-tan-angleton text-[12px] sm:text-[18px] md:text-[34px] font-bold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="mt-0.5 text-[7px] sm:text-[9px] md:text-[11px] uppercase tracking-[0.14em] font-semibold text-white/95">
                    {membershipTypeLabel}
                  </p>
                </div>

                <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[7px] sm:text-[9px] md:text-[11px]">
                  <div>
                    <p className="uppercase tracking-widest text-white/70">
                      {language === 'id' ? 'ID Anggota' : 'Member ID'}
                    </p>
                    <p className="font-bold font-mono truncate">{displayMemberId}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-white/70">
                      {language === 'id' ? 'Universitas' : 'University'}
                    </p>
                    <p className="font-semibold truncate">{user.university || '-'}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-white/70">
                      {language === 'id' ? 'Jurusan' : 'Major'}
                    </p>
                    <p className="font-semibold truncate">{user.major || '-'}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-white/70">
                      {language === 'id' ? 'Domisili / Kampus' : 'Domicile / Campus'}
                    </p>
                    <p className="font-semibold truncate">{user.domicileCampus || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="h-full rounded-lg border border-white/15 bg-black/35 px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 backdrop-blur-[1px] flex flex-col justify-between text-[7px] sm:text-[9px] md:text-[11px]">
                <div>
                  <p className="uppercase tracking-widest text-white/70">
                    {language === 'id' ? 'Ranting' : 'Branch'}
                  </p>
                  <p className="font-semibold truncate">{user.branch || '-'}</p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-white/70">
                    {language === 'id' ? 'Berlaku Sejak' : 'Valid From'}
                  </p>
                  <p className="font-semibold">{membershipStart.toLocaleDateString(locale)}</p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-white/70">
                    {language === 'id' ? 'Berlaku Hingga' : 'Valid Until'}
                  </p>
                  <p className="font-semibold">{membershipEnd.toLocaleDateString(locale)}</p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-white/70">
                    {language === 'id' ? 'Status' : 'Status'}
                  </p>
                  <p className="font-semibold">
                    {isActiveMember
                      ? (language === 'id' ? 'Aktif' : 'Active')
                      : (language === 'id' ? 'Non-Aktif' : 'Non-Active')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8">
            <h3 className="font-tan-angleton font-bold text-2xl text-[#B64847] mb-6">
              {language === 'id' ? 'Informasi Pribadi' : 'Personal Information'}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Email' : 'Email'}
                </p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Kewarganegaraan' : 'Nationality'}
                </p>
                <p className="text-sm font-medium">{user.nationality}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Tanggal Lahir' : 'Date of Birth'}
                </p>
                <p className="text-sm font-medium">
                  {new Date(user.birthDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                </p>
              </div>
            </div>
          </div>

          {/* Educational Information */}
          <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8">
            <h3 className="font-tan-angleton font-bold text-2xl text-[#B64847] mb-6">
              {language === 'id' ? 'Informasi Pendidikan' : 'Educational Information'}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Universitas' : 'University'}
                </p>
                <p className="text-sm font-medium">{user.university}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Jenjang Pendidikan' : 'Education Level'}
                </p>
                <p className="text-sm font-medium">{user.educationLevel}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Jurusan' : 'Major'}
                </p>
                <p className="text-sm font-medium">{user.major}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {language === 'id' ? 'Tanggal Perkiraan Kelulusan' : 'Expected Graduation Date'}
                </p>
                <p className="text-sm font-medium">{expectedGraduationDisplay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className="font-tan-angleton font-bold text-2xl text-[#B64847]">
              {language === 'id' ? 'Edit Data Profil' : 'Edit Profile Data'}
            </h3>
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(true);
                  setProfileMessage(null);
                }}
                className="px-4 py-2 bg-[#B64847] text-white rounded-xl hover:bg-[#9a3a3e] font-bold uppercase tracking-wider text-xs transition-all"
              >
                {language === 'id' ? 'Edit Data' : 'Edit Profile'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelProfileEdit}
                className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] rounded-xl hover:border-[#B64847] hover:text-[#B64847] font-bold uppercase tracking-wider text-xs transition-all"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
            )}
          </div>

          {profileMessage && (
            <div className={`mb-5 p-3 rounded-xl text-sm font-semibold ${
              profileMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {profileMessage.text}
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Nama Depan' : 'First Name'}
                  </p>
                  <input
                    name="firstName"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.firstName}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Nama Belakang' : 'Last Name'}
                  </p>
                  <input
                    name="lastName"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.lastName}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Nomor HP' : 'Phone Number'}
                  </p>
                  <input
                    name="phoneNumber"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.phoneNumber}
                    onChange={handleProfileInputChange}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Nomor Pelajar' : 'Student ID'}
                  </p>
                  <input
                    name="studentId"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.studentId}
                    onChange={handleProfileInputChange}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Kewarganegaraan' : 'Nationality'}
                  </p>
                  <input
                    name="nationality"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.nationality}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Tanggal Lahir' : 'Date of Birth'}
                  </p>
                  <input
                    type="date"
                    name="birthDate"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.birthDate}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Universitas' : 'University'}
                  </p>
                  <input
                    name="university"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.university}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Jenjang Pendidikan' : 'Education Level'}
                  </p>
                  <select
                    name="educationLevel"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847] bg-white"
                    value={profileForm.educationLevel}
                    onChange={handleProfileInputChange}
                    required
                  >
                    <option value="" disabled>
                      {language === 'id' ? 'Pilih jenjang pendidikan' : 'Select education level'}
                    </option>
                    {!isKnownEducationLevel && profileForm.educationLevel && (
                      <option value={profileForm.educationLevel}>{profileForm.educationLevel}</option>
                    )}
                    {EDUCATION_LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Jurusan' : 'Major'}
                  </p>
                  <input
                    name="major"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.major}
                    onChange={handleProfileInputChange}
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Domisili / Kampus' : 'Domicile / Campus'}
                  </p>
                  <input
                    name="domicileCampus"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.domicileCampus}
                    onChange={handleProfileInputChange}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Intake' : 'Intake'}
                  </p>
                  <input
                    name="intake"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.intake}
                    onChange={handleProfileInputChange}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {language === 'id' ? 'Perkiraan Kelulusan' : 'Expected Graduation'}
                  </p>
                  <input
                    name="expectedGraduation"
                    className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                    value={profileForm.expectedGraduation}
                    onChange={handleProfileInputChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2 bg-[#B64847] text-white rounded-xl hover:bg-[#9a3a3e] font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-60"
              >
                {isSavingProfile
                  ? (language === 'id' ? 'Menyimpan...' : 'Saving...')
                  : (language === 'id' ? 'Simpan Perubahan' : 'Save Changes')}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              {language === 'id'
                ? 'Tekan tombol Edit Data jika Anda ingin memperbarui informasi profil.'
                : 'Click Edit Data if you want to update your profile information.'}
            </p>
          )}
        </div>

        {/* Membership Status */}
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8">
          <h3 className="font-tan-angleton font-bold text-2xl text-[#B64847] mb-6">
            {language === 'id' ? 'Status Keanggotaan' : 'Membership Status'}
          </h3>

          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              user.status === 'APPROVED'
                ? isActiveMember
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
                : user.status === 'PENDING'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                  user.status === 'APPROVED'
                    ? isActiveMember ? 'text-green-700' : 'text-gray-700'
                    : user.status === 'PENDING'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  {language === 'id' ? 'Status' : 'Status'}
                </p>
                <p className={`font-bold ${
                  user.status === 'APPROVED'
                    ? isActiveMember ? 'text-green-700' : 'text-gray-700'
                    : user.status === 'PENDING'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  {user.status === 'APPROVED'
                    ? isActiveMember
                      ? language === 'id'
                        ? '✓ Disetujui · Anggota Aktif'
                        : '✓ Approved · Active Member'
                      : language === 'id'
                        ? '⚠ Disetujui · Non-Aktif'
                        : '⚠ Approved · Non-Active'
                    : user.status === 'PENDING'
                    ? language === 'id'
                      ? '⏳ Menunggu'
                      : '⏳ Pending'
                    : language === 'id'
                    ? '✗ Ditolak'
                    : '✗ Rejected'}
                </p>
              </div>
              <span className="text-3xl">
                {user.status === 'APPROVED' ? (isActiveMember ? '🎉' : '⏰') : user.status === 'PENDING' ? '⏳' : '⚠️'}
              </span>
            </div>

            {isApprovedMember && (
              <div className={`p-4 rounded-xl border ${
                isActiveMember
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                  isActiveMember ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {language === 'id' ? 'Hitung Mundur Keanggotaan' : 'Membership Countdown'}
                </p>
                <p className={`font-bold ${
                  isActiveMember ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {isActiveMember
                    ? (language === 'id'
                        ? `Berakhir dalam ${countdown.days} hari ${countdown.hours} jam ${countdown.minutes} menit ${countdown.seconds} detik`
                        : `Expires in ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`)
                    : (language === 'id'
                        ? `Kedaluwarsa ${countdown.days} hari ${countdown.hours} jam ${countdown.minutes} menit ${countdown.seconds} detik lalu`
                        : `Expired ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s ago`)}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 italic">
              {user.status === 'APPROVED' && (
                isActiveMember
                  ? language === 'id'
                    ? 'Anda adalah anggota aktif PPIA Queensland. Nikmati semua manfaat keanggotaan!'
                    : 'You are an active member of PPIA Queensland. Enjoy all member benefits!'
                  : language === 'id'
                    ? 'Keanggotaan Anda sudah tidak aktif. Silakan perpanjang untuk kembali menikmati manfaat anggota.'
                    : 'Your membership is no longer active. Please renew to continue enjoying member benefits.'
              )}
              {user.status === 'PENDING' && (
                language === 'id'
                  ? 'Aplikasi Anda sedang ditinjau oleh admin. Mohon tunggu persetujuan.'
                  : 'Your application is being reviewed by admin. Please wait for approval.'
              )}
              {user.status === 'REJECTED' && (
                language === 'id'
                  ? `Aplikasi Anda ditolak. Alasan: ${user.rejectionReason || 'Tidak ada alasan yang diberikan'}`
                  : `Your application was rejected. Reason: ${user.rejectionReason || 'No reason provided'}`
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
