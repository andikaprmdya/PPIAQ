'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  dateJoined?: string;
}

export default function AdminMembersPage() {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const router = useRouter();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  // Load all members
  useEffect(() => {
    fetchAllMembers();
  }, []);

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setImportMessage({
        type: 'error',
        text: t('admin.crud.failedToFetch', 'Failed to fetch data'),
      });
    } finally {
      setLoading(false);
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
        const template = t('admin.members.importCompleted', 'Import completed: {imported} imported, {updated} updated, {skipped} skipped');
        setImportMessage({
          type: 'success',
          text: template
            .replace('{imported}', String(data.results.imported))
            .replace('{updated}', String(data.results.updated))
            .replace('{skipped}', String(data.results.skipped)),
        });
        // Refresh members list
        await fetchAllMembers();
      } else {
        setImportMessage({
          type: 'error',
          text: data.error || t('admin.members.importFailed', 'Import failed'),
        });
      }
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: t('admin.members.importError', 'Error during import'),
      });
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
      // Reset file input
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

  const handleUnreject = async (userId: string) => {
    if (!confirm(t('admin.members.unrejectConfirm', 'Change this member status back to pending?'))) return;

    try {
      const response = await fetch('/api/admin/users/unreject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setImportMessage({
          type: 'success',
          text: t('admin.members.memberStatusChangedToPending', 'Member status changed back to pending'),
        });
        await fetchAllMembers();
      }
    } catch (error) {
      console.error('Unreject error:', error);
      setImportMessage({
        type: 'error',
        text: t('admin.members.errorChangingStatus', 'Error changing member status'),
      });
    }
  };

  const filteredMembers = filterStatus === 'all'
    ? members
    : members.filter(m => m.status === filterStatus);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-[#B64847] hover:text-[#9a3a3e] font-semibold mb-4 inline-block"
          >
            ← {getTranslation(translations.common.backToDashboard, language)}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.members.title', 'Members Management')}</h1>
          <p className="text-gray-600">{t('admin.members.description', 'Manage all PPIAQ members and memberships')}</p>
        </div>

        {/* Messages */}
        {importMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            importMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importMessage.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <label className="px-4 py-2 bg-[#B64847] text-white rounded-lg hover:bg-[#9a3a3e] cursor-pointer font-semibold transition">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              disabled={importLoading}
              className="hidden"
            />
            📤 {t('admin.members.importCsvExcel', 'Import CSV/Excel')}
          </label>

          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            📥 {t('admin.members.exportToCsv', 'Export to CSV')}
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
          >
            📥 {t('admin.members.exportToExcel', 'Export to Excel')}
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-[#B64847] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-[#B64847]'
              }`}
            >
              {status === 'all'
                ? getTranslation(translations.common.all, language)
                : status === 'pending'
                  ? getTranslation(translations.common.pending, language)
                  : status === 'approved'
                    ? getTranslation(translations.common.approved, language)
                    : getTranslation(translations.common.rejected, language)}
            </button>
          ))}
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-600">{t('admin.members.loadingMembers', 'Loading members...')}</div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">{t('admin.members.noMembersFound', 'No members found')}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.name, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.email, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.phone, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.studentId, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.university, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.type, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.status, language)}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{getTranslation(translations.common.actions, language)}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">{member.firstName} {member.lastName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.studentId || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.university}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        member.membershipType === 'ordinary'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {member.membershipType === 'ordinary'
                          ? getTranslation(translations.common.ordinary, language)
                          : getTranslation(translations.common.associate, language)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        member.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : member.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status === 'pending'
                          ? getTranslation(translations.common.pending, language)
                          : member.status === 'approved'
                            ? getTranslation(translations.common.approved, language)
                            : getTranslation(translations.common.rejected, language)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/members/${member.id}/edit`}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                        >
                          {getTranslation(translations.common.edit, language)}
                        </Link>
                        {member.status === 'rejected' && (
                          <button
                            onClick={() => handleUnreject(member.id)}
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                          >
                            {t('admin.members.unreject', 'Unreject')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-gray-900">{members.length}</div>
            <div className="text-gray-600 font-semibold">{t('admin.members.totalMembers', 'Total Members')}</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-yellow-800">{members.filter(m => m.status === 'pending').length}</div>
            <div className="text-gray-600 font-semibold">{getTranslation(translations.common.pending, language)}</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-800">{members.filter(m => m.status === 'approved').length}</div>
            <div className="text-gray-600 font-semibold">{getTranslation(translations.common.approved, language)}</div>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-red-800">{members.filter(m => m.status === 'rejected').length}</div>
            <div className="text-gray-600 font-semibold">{getTranslation(translations.common.rejected, language)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
