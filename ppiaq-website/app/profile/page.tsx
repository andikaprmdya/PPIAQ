'use client';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
        </div>
      </main>
    );
  }

  const memberSince = new Date(user.createdAt);
  const validUntil = new Date(memberSince);
  validUntil.setFullYear(validUntil.getFullYear() + 1);

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
                    <p className="text-xl font-bold font-mono">{user.id.padStart(6, '0')}</p>
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
                      {user.membershipType === 'ordinary'
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
                    {memberSince.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                    {language === 'id' ? 'Berlaku Hingga' : 'Valid Until'}
                  </p>
                  <p className="text-lg font-bold">
                    {validUntil.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
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
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-1">
                  {language === 'id' ? 'Status' : 'Status'}
                </p>
                <p className="font-bold text-green-700">
                  {user.status === 'approved'
                    ? language === 'id'
                      ? '✓ Disetujui'
                      : '✓ Approved'
                    : user.status === 'pending'
                    ? language === 'id'
                      ? '⏳ Menunggu'
                      : '⏳ Pending'
                    : language === 'id'
                    ? '✗ Ditolak'
                    : '✗ Rejected'}
                </p>
              </div>
              <span className="text-3xl">🎉</span>
            </div>

            <p className="text-sm text-gray-600 italic">
              {user.status === 'approved' && (
                language === 'id'
                  ? 'Anda adalah anggota aktif PPIA Queensland. Nikmati semua manfaat keanggotaan!'
                  : 'You are an active member of PPIA Queensland. Enjoy all member benefits!'
              )}
              {user.status === 'pending' && (
                language === 'id'
                  ? 'Aplikasi Anda sedang ditinjau oleh admin. Mohon tunggu persetujuan.'
                  : 'Your application is being reviewed by admin. Please wait for approval.'
              )}
              {user.status === 'rejected' && (
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
