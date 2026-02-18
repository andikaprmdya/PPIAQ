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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'newsletter'>('PENDING');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState<{ imported: number; updated: number; skipped: number; errors: string[] } | null>(null);
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
          setApprovedUsers([...approvedUsers, { ...approvedUser, status: 'APPROVED' }]);
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
          setRejectedUsers([...rejectedUsers, { ...rejectedUser, status: 'REJECTED' }]);
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
          setPendingUsers([...pendingUsers, { ...unrejectUser, status: 'PENDING' }]);
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
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportResults(data.results);
        setImportMessage({
          type: 'success',
          text: `Import completed: ${data.results.imported} created, ${data.results.updated} updated, ${data.results.skipped} skipped`,
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
        text: 'Error during import. Please check your file format.',
      });
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone Number', 'Student ID', 'Membership Type', 'Status', 'Date Joined', 'Nationality', 'Education Level', 'University', 'Major'];
    const exampleRow1 = ['John', 'Doe', 'john.doe@email.com', '+61400000000', 'S1234567', 'ordinary', 'approved', '2025-01-01', 'Indonesia', 'S1 (Bachelor)', 'University of Queensland', 'Computer Science'];
    const exampleRow2 = ['Jane', 'Smith', 'jane.smith@email.com', '+61411111111', 'S7654321', 'associate', 'pending', '', 'Other', 'S2 (Master)', 'Griffith University', 'Business'];
    const csvContent = [headers.join(','), exampleRow1.join(','), exampleRow2.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ppiaq-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
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
    activeTab === 'PENDING' ? pendingUsers
    : activeTab === 'APPROVED' ? approvedUsers
    : activeTab === 'REJECTED' ? rejectedUsers
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

        {/* Import/Export Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => { setShowImportModal(true); setImportMessage(null); setImportResults(null); }}
            className="px-6 py-3 bg-[#B64847] text-white rounded-xl hover:bg-[#9a3a3e] font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2"
          >
            📤 {language === 'id' ? 'Import CSV/Excel' : 'Import CSV/Excel'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold uppercase tracking-widest text-xs transition-all"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold uppercase tracking-widest text-xs transition-all"
          >
            📥 Export Excel
          </button>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!importLoading) setShowImportModal(false); }} />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-[#E4DBCA] overflow-hidden">
              {/* Header */}
              <div className="bg-[#B64847] px-8 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Admin Panel</p>
                    <h2 className="font-tan-angleton text-white text-2xl font-bold">Import Members</h2>
                  </div>
                  {!importLoading && (
                    <button onClick={() => setShowImportModal(false)} className="text-white/70 hover:text-white text-2xl transition-colors leading-none">✕</button>
                  )}
                </div>
              </div>

              <div className="px-8 py-6 space-y-6">

                {/* Step 1: Download Template */}
                <div className="bg-[#FFFAF5] rounded-2xl border border-[#E4DBCA] p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#FEB602] rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">1</div>
                    <div className="flex-1">
                      <p className="font-bold text-[#303030] mb-1">Download Template</p>
                      <p className="text-xs text-gray-500 mb-3">Download the CSV template, fill in member data, then upload below.</p>
                      <button
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#B64847] hover:text-white transition-all"
                      >
                        ⬇ Download Template CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template Format Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Required Columns</p>
                  <div className="flex flex-wrap gap-1">
                    {['First Name', 'Last Name', 'Email'].map(col => (
                      <span key={col} className="px-2 py-0.5 bg-[#B64847]/10 text-[#B64847] rounded text-[10px] font-bold">{col} *</span>
                    ))}
                    {['Phone Number', 'Student ID', 'Membership Type', 'Status', 'Date Joined', 'Nationality', 'Education Level', 'University', 'Major'].map(col => (
                      <span key={col} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-medium">{col}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Membership Type: <code>ordinary</code> or <code>associate</code> · Status: <code>pending</code>, <code>approved</code>, or <code>rejected</code> · New users get temp password: <code>TempPass123!</code></p>
                </div>

                {/* Step 2: Upload File */}
                <div className="bg-[#FFFAF5] rounded-2xl border border-[#E4DBCA] p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#B64847] rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">2</div>
                    <div className="flex-1">
                      <p className="font-bold text-[#303030] mb-1">Upload File</p>
                      <p className="text-xs text-gray-500 mb-3">Supports CSV, XLSX, and XLS formats.</p>
                      <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                        importLoading
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#B64847] text-white hover:bg-[#9a3a3e]'
                      }`}>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleImport}
                          disabled={importLoading}
                          className="hidden"
                        />
                        {importLoading ? '⏳ Importing...' : '📤 Choose File & Import'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Result */}
                {importMessage && (
                  <div className={`rounded-2xl p-4 border ${
                    importMessage.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <p className="font-bold text-sm mb-1">{importMessage.type === 'success' ? '✅' : '❌'} {importMessage.text}</p>
                    {importResults && importResults.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-bold mb-1">Errors ({importResults.errors.length}):</p>
                        <ul className="text-xs space-y-0.5 max-h-24 overflow-y-auto">
                          {importResults.errors.map((err, i) => <li key={i}>• {err}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Close button after done */}
                {importMessage && (
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="w-full px-4 py-3 bg-[#303030] text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-[#B64847] transition-all"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['PENDING', 'APPROVED', 'REJECTED', 'newsletter'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-full whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#B64847] text-white'
                  : 'bg-white border-2 border-[#E4DBCA] text-[#B64847] hover:border-[#B64847]'
              }`}
            >
              {tab === 'PENDING' && `${language === 'id' ? 'Menunggu' : 'Pending'} (${pendingUsers.length})`}
              {tab === 'APPROVED' && `${language === 'id' ? 'Disetujui' : 'Approved'} (${approvedUsers.length})`}
              {tab === 'REJECTED' && `${language === 'id' ? 'Ditolak' : 'Rejected'} (${rejectedUsers.length})`}
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
              {activeTab === 'PENDING' && (language === 'id' ? 'Tidak ada aplikasi menunggu' : 'No pending applications')}
              {activeTab === 'APPROVED' && (language === 'id' ? 'Tidak ada pengguna yang disetujui' : 'No approved users')}
              {activeTab === 'REJECTED' && (language === 'id' ? 'Tidak ada pengguna yang ditolak' : 'No rejected users')}
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
                      appUser.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : appUser.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {appUser.status === 'PENDING'
                      ? language === 'id'
                        ? 'Menunggu'
                        : 'Pending'
                      : appUser.status === 'APPROVED'
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
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' })}
                          className="w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
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
              {selectedUser.status === 'PENDING' && (
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
              {selectedUser.status === 'REJECTED' && (
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
              {selectedUser.status === 'APPROVED' && (
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
