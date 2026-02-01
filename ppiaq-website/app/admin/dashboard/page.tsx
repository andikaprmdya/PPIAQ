'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  educationLevel: string;
  university: string;
  major: string;
  birthDate: string;
  membershipType: 'ordinary' | 'associate';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  paymentProofUrl?: string;
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  // Load users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch('/api/admin/users?status=pending'),
        fetch('/api/admin/users?status=approved'),
        fetch('/api/admin/users?status=rejected'),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingUsers(data);
      }
      if (approvedRes.ok) {
        const data = await approvedRes.json();
        setApprovedUsers(data);
      }
      if (rejectedRes.ok) {
        const data = await rejectedRes.json();
        setRejectedUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!user?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminId: user.id }),
      });

      if (response.ok) {
        // Update local state
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        const approvedUser = pendingUsers.find((u) => u.id === userId);
        if (approvedUser) {
          setApprovedUsers([...approvedUsers, { ...approvedUser, status: 'approved' }]);
        }
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!user?.id || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminId: user.id, reason: rejectionReason }),
      });

      if (response.ok) {
        // Update local state
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        const rejectedUser = pendingUsers.find((u) => u.id === userId);
        if (rejectedUser) {
          setRejectedUsers([...rejectedUsers, { ...rejectedUser, status: 'rejected' }]);
        }
        setSelectedUser(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Failed to reject user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const displayUsers = activeTab === 'pending' ? pendingUsers : activeTab === 'approved' ? approvedUsers : rejectedUsers;

  if (loading) {
    return (
      <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFFAF5] text-[#303030] font-montserrat min-h-screen py-16 px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="font-nickainley text-2xl text-[#886644] mb-2">
            {language === 'id' ? 'Panel Admin' : 'Admin Panel'}
          </p>
          <h1 className="font-tan-angleton font-bold text-4xl md:text-5xl text-[#B64847] uppercase tracking-tighter mb-4">
            {language === 'id' ? 'Kelola Aplikasi' : 'Manage Applications'}
          </h1>
          <div className="w-12 h-1 bg-[#FEB602] rounded-full"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-full whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#B64847] text-white'
                  : 'bg-white border-2 border-[#E4DBCA] text-[#B64847] hover:border-[#B64847]'
              }`}
            >
              {tab === 'pending' && `${language === 'id' ? 'Menunggu' : 'Pending'} (${pendingUsers.length})`}
              {tab === 'approved' && `${language === 'id' ? 'Disetujui' : 'Approved'} (${approvedUsers.length})`}
              {tab === 'rejected' && `${language === 'id' ? 'Ditolak' : 'Rejected'} (${rejectedUsers.length})`}
            </button>
          ))}
        </div>

        {/* Users Grid */}
        {displayUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {activeTab === 'pending' && (language === 'id' ? 'Tidak ada aplikasi menunggu' : 'No pending applications')}
              {activeTab === 'approved' && (language === 'id' ? 'Tidak ada pengguna yang disetujui' : 'No approved users')}
              {activeTab === 'rejected' && (language === 'id' ? 'Tidak ada pengguna yang ditolak' : 'No rejected users')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayUsers.map((appUser) => (
              <div
                key={appUser.id}
                className="bg-white rounded-2xl border border-[#E4DBCA] p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedUser(appUser)}
              >
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-[#B64847] group-hover:text-[#303030] transition-colors">
                    {appUser.firstName} {appUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{appUser.email}</p>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p>
                    <span className="font-bold text-[#886644]">{language === 'id' ? 'Universitas:' : 'University:'}</span>{' '}
                    {appUser.university}
                  </p>
                  <p>
                    <span className="font-bold text-[#886644]">{language === 'id' ? 'Jurusan:' : 'Major:'}</span>{' '}
                    {appUser.major}
                  </p>
                  <p>
                    <span className="font-bold text-[#886644]">{language === 'id' ? 'Tingkat:' : 'Level:'}</span>{' '}
                    {appUser.educationLevel}
                  </p>
                  <p>
                    <span className="font-bold text-[#886644]">{language === 'id' ? 'Keanggotaan:' : 'Type:'}</span>{' '}
                    {appUser.membershipType === 'ordinary'
                      ? language === 'id'
                        ? 'Biasa'
                        : 'Ordinary'
                      : language === 'id'
                      ? 'Asosiasi'
                      : 'Associate'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E4DBCA]">
                  <span
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      appUser.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : appUser.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {appUser.status === 'pending'
                      ? language === 'id'
                        ? 'Menunggu'
                        : 'Pending'
                      : appUser.status === 'approved'
                      ? language === 'id'
                        ? 'Disetujui'
                        : 'Approved'
                      : language === 'id'
                      ? 'Ditolak'
                      : 'Rejected'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(appUser.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-gray-600 text-sm">{selectedUser.email}</p>
              </div>

              {/* User Details */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {language === 'id' ? 'Kewarganegaraan' : 'Nationality'}
                    </p>
                    <p className="text-sm font-medium">{selectedUser.nationality}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {language === 'id' ? 'Tanggal Lahir' : 'Birth Date'}
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(selectedUser.birthDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {language === 'id' ? 'Universitas' : 'University'}
                    </p>
                    <p className="text-sm font-medium">{selectedUser.university}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {language === 'id' ? 'Jurusan' : 'Major'}
                    </p>
                    <p className="text-sm font-medium">{selectedUser.major}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {language === 'id' ? 'Jenjang Pendidikan' : 'Education Level'}
                    </p>
                    <p className="text-sm font-medium">{selectedUser.educationLevel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {language === 'id' ? 'Jenis Keanggotaan' : 'Membership Type'}
                    </p>
                    <p className="text-sm font-medium">
                      {selectedUser.membershipType === 'ordinary'
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

              {/* Payment Proof Preview */}
              {selectedUser.paymentProofUrl && (
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-3">
                    {language === 'id' ? 'Bukti Pembayaran' : 'Payment Proof'}
                  </p>
                  <img
                    src={selectedUser.paymentProofUrl}
                    alt="Payment Proof"
                    className="w-full h-64 object-contain rounded-2xl border border-[#E4DBCA]"
                  />
                </div>
              )}

              {/* Action Section */}
              {selectedUser.status === 'pending' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {language === 'id' ? 'Alasan Penolakan (jika ditolak)' : 'Rejection Reason (if rejected)'}
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847] transition-all text-sm"
                      placeholder={
                        language === 'id'
                          ? 'Tuliskan alasan jika ingin menolak...'
                          : 'Enter reason if rejecting...'
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (language === 'id' ? 'Sedang...' : 'Loading...') : (language === 'id' ? 'Setujui' : 'Approve')}
                    </button>
                    <button
                      onClick={() => handleReject(selectedUser.id)}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (language === 'id' ? 'Sedang...' : 'Loading...') : (language === 'id' ? 'Tolak' : 'Reject')}
                    </button>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full px-6 py-2 border-2 border-[#B64847] text-[#B64847] font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-[#B64847] hover:text-white transition-all"
              >
                {language === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
