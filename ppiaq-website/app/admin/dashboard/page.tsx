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
  phoneNumber?: string;
  studentId?: string;
  nationality: string;
  educationLevel: string;
  university: string;
  major: string;
  birthDate: string;
  membershipType: 'ordinary' | 'associate';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
  paymentProofUrl?: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'newsletter'>('pending');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [editError, setEditError] = useState<string | null>(null);

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
      const [pendingRes, approvedRes, rejectedRes, newsletterRes] = await Promise.all([
        fetch('/api/admin/users?status=pending'),
        fetch('/api/admin/users?status=approved'),
        fetch('/api/admin/users?status=rejected'),
        fetch('/api/admin/newsletter'),
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
      if (newsletterRes.ok) {
        const data = await newsletterRes.json();
        setNewsletterSubscribers(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const handleUnreject = async (userId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/unreject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Update local state
        setRejectedUsers(rejectedUsers.filter((u) => u.id !== userId));
        const unrejectUser = rejectedUsers.find((u) => u.id === userId);
        if (unrejectUser) {
          setPendingUsers([...pendingUsers, { ...unrejectUser, status: 'pending' }]);
        }
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to unreject user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportMessage({
          type: 'success',
          text: `Import completed: ${data.results.imported} imported, ${data.results.updated} updated`,
        });
        await fetchUsers();
      } else {
        setImportMessage({
          type: 'error',
          text: data.error || 'Import failed',
        });
      }
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: 'Error during import',
      });
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/users/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = format === 'csv' ? 'ppiaq-members.csv' : 'ppiaq-members.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleEditModeToggle = (user: User) => {
    if (!editMode) {
      // Opening edit mode - pre-fill with current data
      setEditFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        studentId: user.studentId || '',
        email: user.email,
        nationality: user.nationality,
        educationLevel: user.educationLevel,
        university: user.university,
        major: user.major,
        birthDate: user.birthDate,
        membershipType: user.membershipType,
        status: user.status,
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    setEditError(null);
    try {
      console.log('Saving user:', selectedUser.id, 'with data:', editFormData);

      const response = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      console.log('Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', contentType, text.substring(0, 200));
        setEditError(`Server error: ${response.status} - Invalid response format`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        const updatedUserData = data.user;

        // Update in all lists
        setPendingUsers(pendingUsers.map((u) => (u.id === selectedUser.id ? updatedUserData : u)));
        setApprovedUsers(approvedUsers.map((u) => (u.id === selectedUser.id ? updatedUserData : u)));
        setRejectedUsers(rejectedUsers.map((u) => (u.id === selectedUser.id ? updatedUserData : u)));
        setSelectedUser(updatedUserData);
        setEditMode(false);
        setEditError(null);
      } else {
        setEditError(data.error || data.details || 'Failed to update user');
        console.error('API Error:', data);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setEditError(`Error: ${errorMsg}`);
      console.error('Failed to save edit:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const displayUsers =
    activeTab === 'pending' ? pendingUsers
    : activeTab === 'approved' ? approvedUsers
    : activeTab === 'rejected' ? rejectedUsers
    : [];

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

        {/* Import/Export Message */}
        {importMessage && (
          <div className={`mb-6 p-4 rounded-xl ${
            importMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importMessage.text}
          </div>
        )}

        {/* Import/Export Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <label className="px-6 py-3 bg-[#B64847] text-white rounded-xl hover:bg-[#9a3a3e] cursor-pointer font-bold uppercase tracking-widest text-xs transition-all">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              disabled={importLoading}
              className="hidden"
            />
            📤 {language === 'id' ? 'Import CSV/Excel' : 'Import CSV/Excel'}
          </label>
          <button
            onClick={() => handleExport('csv')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold uppercase tracking-widest text-xs transition-all"
          >
            📥 CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold uppercase tracking-widest text-xs transition-all"
          >
            📥 Excel
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['pending', 'approved', 'rejected', 'newsletter'] as const).map((tab) => (
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
              {tab === 'newsletter' && `${language === 'id' ? 'Newsletter' : 'Newsletter'} (${newsletterSubscribers.length})`}
            </button>
          ))}
        </div>

        {/* Users Grid / Newsletter List */}
        {activeTab === 'newsletter' ? (
          // Newsletter Subscribers
          newsletterSubscribers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {language === 'id' ? 'Tidak ada subscriber newsletter' : 'No newsletter subscribers'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E4DBCA] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#B64847] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold uppercase text-xs tracking-widest">Email</th>
                      <th className="px-6 py-4 text-left font-bold uppercase text-xs tracking-widest">
                        {language === 'id' ? 'Bergabung' : 'Subscribed'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletterSubscribers.map((sub) => (
                      <tr key={sub.id} className="border-t border-[#E4DBCA] hover:bg-[#FFFAF5] transition-all">
                        <td className="px-6 py-4 text-sm font-medium">{sub.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(sub.subscribedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : displayUsers.length === 0 ? (
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

              {/* Edit Mode */}
              {editMode && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-bold text-[#B64847] mb-4">{language === 'id' ? 'Edit Data Member' : 'Edit Member Data'}</h3>

                  {editError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-semibold text-sm">❌ {editError}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">First Name</label>
                        <input
                          type="text"
                          value={editFormData.firstName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Last Name</label>
                        <input
                          type="text"
                          value={editFormData.lastName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Phone Number</label>
                        <input
                          type="tel"
                          value={editFormData.phoneNumber || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Student ID</label>
                        <input
                          type="text"
                          value={editFormData.studentId || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Nationality</label>
                        <input
                          type="text"
                          value={editFormData.nationality || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Education Level</label>
                        <input
                          type="text"
                          value={editFormData.educationLevel || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, educationLevel: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">University</label>
                        <input
                          type="text"
                          value={editFormData.university || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, university: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Major</label>
                        <input
                          type="text"
                          value={editFormData.major || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Membership Type</label>
                        <select
                          value={editFormData.membershipType || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, membershipType: e.target.value as 'ordinary' | 'associate' })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        >
                          <option value="ordinary">Ordinary</option>
                          <option value="associate">Associate</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 block">Status</label>
                        <select
                          value={editFormData.status || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'pending' | 'approved' | 'rejected' })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : (language === 'id' ? 'Simpan' : 'Save')}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 px-4 py-3 bg-gray-400 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-gray-500 transition-all"
                    >
                      {language === 'id' ? 'Batal' : 'Cancel'}
                    </button>
                  </div>
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
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-blue-700 transition-all"
                    >
                      {language === 'id' ? 'Edit' : 'Edit'}
                    </button>
                  </div>
                </div>
              )}

              {/* Unreject Button for Rejected Users */}
              {selectedUser.status === 'rejected' && (
                <div className="space-y-4 mb-6">
                  {selectedUser.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">
                        {language === 'id' ? 'Alasan Penolakan' : 'Rejection Reason'}
                      </p>
                      <p className="text-sm text-red-800">{selectedUser.rejectionReason}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUnreject(selectedUser.id)}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (language === 'id' ? 'Sedang...' : 'Loading...') : (language === 'id' ? 'Batalkan Penolakan' : 'Unreject')}
                    </button>
                    <button
                      onClick={() => handleEditModeToggle(selectedUser)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-blue-700 transition-all"
                    >
                      {editMode ? (language === 'id' ? 'Batal' : 'Cancel') : (language === 'id' ? 'Edit' : 'Edit')}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Button for Approved Users */}
              {selectedUser.status === 'approved' && (
                <div className="mb-6">
                  <button
                    onClick={() => handleEditModeToggle(selectedUser)}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-blue-700 transition-all"
                  >
                    {editMode ? (language === 'id' ? 'Batal' : 'Cancel') : (language === 'id' ? 'Edit Data' : 'Edit Data')}
                  </button>
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
