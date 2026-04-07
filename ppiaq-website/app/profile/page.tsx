'use client';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
        </div>
      </main>
    );
  }

  const membershipStart = useMemo(
    () =>
      parseDateValue(user.dateJoined) ||
      parseDateValue(user.approvedAt) ||
      parseDateValue(user.createdAt) ||
      new Date(),
    [user.dateJoined, user.approvedAt, user.createdAt]
  );

  const membershipEnd = useMemo(
    () => parseDateValue(user.membershipTermEnds) || addOneYear(membershipStart),
    [user.membershipTermEnds, membershipStart]
  );

  const remainingMs = membershipEnd.getTime() - now;
  const isApprovedMember = user.status === 'APPROVED';
  const isActiveMember = isApprovedMember && remainingMs > 0;
  const countdown = formatCountdown(Math.abs(remainingMs));
  const displayMemberId = user.memberNo || user.id.padStart(6, '0');
  const membershipTypeLabel =
    user.membershipType === 'ORDINARY'
      ? language === 'id'
        ? 'Anggota Biasa'
        : 'Ordinary Member'
      : language === 'id'
      ? 'Anggota Asosiasi'
      : 'Associate Member';
  const locale = language === 'id' ? 'id-ID' : 'en-US';

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

          <div className="relative h-[250px] sm:h-[300px] md:h-[360px] rounded-3xl text-white shadow-2xl border-2 border-[#FEB602] overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/ppiaq-2026-membership-card-design.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />

            <div className="relative z-10 h-full p-4 sm:p-6 md:p-8">
              <div className="pt-[23%] sm:pt-[20%] md:pt-[18%] max-w-[90%] sm:max-w-[76%]">
                <h3 className="font-tan-angleton text-xl sm:text-2xl md:text-4xl font-bold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold text-white/95">
                  {membershipTypeLabel}
                </p>

                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] sm:text-xs">
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
            </div>
          </div>
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
