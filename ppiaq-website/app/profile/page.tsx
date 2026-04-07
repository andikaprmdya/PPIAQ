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

          <div className="bg-gradient-to-br from-[#B64847] to-[#303030] rounded-3xl p-8 md:p-12 text-white shadow-2xl border-2 border-[#FEB602] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 border-4 border-white rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-4 border-white rounded-full -ml-16 -mb-16"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              {/* Left Side - Info */}
              <div className="flex-1">
                <p className="font-nickainley text-3xl mb-4 opacity-90">
                  PPIA Queensland
                </p>
                <h3 className="font-tan-angleton text-3xl font-bold mb-6">{user.firstName} {user.lastName}</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                      {language === 'id' ? 'ID Anggota' : 'Member ID'}
                    </p>
                    <p className="text-xl font-bold font-mono">{displayMemberId}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                      {language === 'id' ? 'Universitas' : 'University'}
                    </p>
                    <p className="font-medium">{user.university}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                      {language === 'id' ? 'Jenis Keanggotaan' : 'Membership Type'}
                    </p>
                    <p className="font-medium">
                      {user.membershipType === 'ORDINARY'
                        ? language === 'id'
                          ? 'Anggota Biasa'
                          : 'Ordinary Member'
                        : language === 'id'
                        ? 'Anggota Asosiasi'
                        : 'Associate Member'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Validity */}
              <div className="space-y-4 text-right md:text-left">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                    {language === 'id' ? 'Berlaku Sejak' : 'Valid From'}
                  </p>
                  <p className="text-lg font-bold">
                    {membershipStart.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                    {language === 'id' ? 'Berlaku Hingga' : 'Valid Until'}
                  </p>
                  <p className="text-lg font-bold">
                    {membershipEnd.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                  </p>
                </div>

                <div className="text-3xl">🎓</div>
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
