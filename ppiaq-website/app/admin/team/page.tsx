'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

interface TeamMember {
  id: string;
  name: string;
  role: { id: string; en: string };
  university: string;
  instagram: string;
  division: TeamDivision;
  isActive: boolean;
  order: number;
}

const DIVISIONS = ['CORE', 'ADMIN', 'EDUCATION', 'SPORTS', 'MEDIA', 'PARTNERSHIP'] as const;
type TeamDivision = (typeof DIVISIONS)[number];
type TeamFilter = 'all' | TeamDivision;

const DIVISION_LABELS: Record<TeamDivision, { id: string; en: string }> = {
  CORE: { id: 'Inti', en: 'Core' },
  ADMIN: { id: 'Administrasi', en: 'Administration' },
  EDUCATION: { id: 'Pendidikan', en: 'Education' },
  SPORTS: { id: 'Olahraga', en: 'Sports' },
  MEDIA: { id: 'Media', en: 'Media' },
  PARTNERSHIP: { id: 'Kemitraan', en: 'Partnership' },
};

export default function TeamManagementPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TeamFilter>('all');
  const [viewMoreEnabled, setViewMoreEnabled] = useState(true);
  const [viewMoreLoading, setViewMoreLoading] = useState(true);
  const [viewMoreSaving, setViewMoreSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });

  useEffect(() => {
    let isMounted = true;

    const refreshMembers = async () => {
      try {
        const res = await fetch('/api/admin/team', { cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            alert(
              language === 'id'
                ? 'Sesi admin Anda sudah tidak valid. Silakan login ulang.'
                : 'Your admin session is no longer valid. Please sign in again.'
            );
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch team members');
        }

        const data = await res.json();
        const sorted = Array.isArray(data?.data)
          ? [...data.data].sort((a: TeamMember, b: TeamMember) => a.order - b.order)
          : [];

        if (!isMounted) return;
        setMembers(sorted);
      } catch (error) {
        console.error('Error fetching members:', error);
        if (isMounted) {
          alert(language === 'id' ? 'Gagal mengambil anggota tim' : 'Failed to fetch team members');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const refreshViewMoreSetting = async () => {
      try {
        const res = await fetch('/api/admin/team/view-more', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to fetch view-more setting');
        }

        const data = await res.json();
        if (!isMounted) return;
        setViewMoreEnabled(Boolean(data?.data?.enabled));
      } catch (error) {
        console.error('Error fetching team view-more setting:', error);
        if (isMounted) {
          alert(
            language === 'id'
              ? 'Gagal mengambil pengaturan tombol lihat semua'
              : 'Failed to fetch view-more setting'
          );
        }
      } finally {
        if (isMounted) {
          setViewMoreLoading(false);
        }
      }
    };

    const refreshAll = async () => {
      await Promise.all([refreshMembers(), refreshViewMoreSetting()]);
    };

    refreshAll();
    const intervalId = setInterval(refreshAll, 30000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [language, router]);

  const filteredMembers = filter === 'all' ? members : members.filter((m) => m.division === filter);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete member');
      }

      setMembers((prev) => prev.filter((m) => m.id !== id));
      alert(t('admin.team.memberDeletedSuccessfully', 'Member deleted successfully'));
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(t('admin.team.failedToDeleteMember', 'Failed to delete member'));
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });

      if (!res.ok) {
        throw new Error('Failed to update member');
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
              ...m,
              isActive: !m.isActive,
            }
            : m
        )
      );
    } catch (error) {
      console.error('Error toggling member status:', error);
      alert(t('admin.team.failedToUpdateMember', 'Failed to update member'));
    }
  };

  const handleToggleViewMore = async () => {
    const nextEnabled = !viewMoreEnabled;
    setViewMoreSaving(true);

    try {
      const res = await fetch('/api/admin/team/view-more', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled }),
      });

      if (!res.ok) {
        throw new Error('Failed to update view-more setting');
      }

      setViewMoreEnabled(nextEnabled);
      alert(
        nextEnabled
          ? t('admin.team.viewMoreEnabledMessage', 'View More is now enabled on About page')
          : t('admin.team.viewMoreDisabledMessage', 'View More is now disabled on About page')
      );
    } catch (error) {
      console.error('Error updating team view-more setting:', error);
      alert(t('admin.team.failedToUpdateViewMoreSetting', 'Failed to update view-more setting'));
    } finally {
      setViewMoreSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
            {t('admin.team.title', 'Manage Team')}
          </h1>
          <p className="text-[#886644] text-sm">
            {t('admin.team.description', 'Add, edit, and organize team members')}
          </p>
        </div>

        <Link
          href="/admin/team/create"
          className="w-full lg:w-auto px-8 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase text-center"
        >
          + {t('admin.team.addMember', 'Add Member')}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-5 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-base text-[#B64847] uppercase tracking-wider">
              {t('admin.team.viewMoreButtonControl', 'About Page View More Button')}
            </h2>
            <p className="text-sm text-[#886644] mt-1">
              {t(
                'admin.team.viewMoreButtonControlDescription',
                'Control whether visitors can open the full team page from the About section.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                viewMoreEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {viewMoreEnabled
                ? `✅ ${getTranslation(translations.common.active, language)}`
                : `❌ ${getTranslation(translations.common.inactive, language)}`}
            </span>
            <button
              onClick={handleToggleViewMore}
              disabled={viewMoreSaving || viewMoreLoading}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#B64847] text-white hover:bg-[#303030] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {viewMoreLoading
                ? t('common.loading', 'Loading...')
                : viewMoreSaving
                  ? t('common.processing', 'Processing...')
                  : viewMoreEnabled
                    ? t('admin.team.disableViewMore', 'Disable View More')
                    : t('admin.team.enableViewMore', 'Enable View More')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
            filter === 'all'
              ? 'bg-[#B64847] text-white'
              : 'bg-white border border-[#E4DBCA] text-[#886644] hover:border-[#B64847]'
          }`}
        >
          {getTranslation(translations.common.all, language)}
        </button>
        {DIVISIONS.map((div) => (
          <button
            key={div}
            onClick={() => setFilter(div)}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
              filter === div
                ? 'bg-[#B64847] text-white'
                : 'bg-white border border-[#E4DBCA] text-[#886644] hover:border-[#B64847]'
            }`}
          >
            {getTranslation(DIVISION_LABELS[div], language)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">{t('admin.team.loadingMember', 'Loading member...')}</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold mb-4">{t('admin.team.noMembersFound', 'No team members found')}</p>
          <Link
            href="/admin/team/create"
            className="inline-block px-6 py-2 bg-[#B64847] text-white font-bold rounded-lg text-sm"
          >
            {t('admin.team.addFirstMember', 'Add first member')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-[#E4DBCA] p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#B64847]">{member.name}</h3>
                  <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mt-1">
                    {language === 'id' ? member.role.id : member.role.en}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.isActive
                    ? `✅ ${getTranslation(translations.common.active, language)}`
                    : `❌ ${getTranslation(translations.common.inactive, language)}`}
                </span>
              </div>

              <div className="space-y-1 text-sm mb-4">
                <p>
                  <span className="font-bold text-[#886644]">
                    {t('admin.team.department', 'Department')}:
                  </span>{' '}
                  <span className="text-[#303030]">{getTranslation(DIVISION_LABELS[member.division], language)}</span>
                </p>
                <p>
                  <span className="font-bold text-[#886644]">
                    {t('admin.team.university', 'University')}:
                  </span>{' '}
                  <span className="text-[#303030]">{member.university || '-'}</span>
                </p>
                <p>
                  <span className="font-bold text-[#886644]">
                    {t('admin.team.instagram', 'Instagram')}:
                  </span>{' '}
                  <span className="text-[#303030]">{member.instagram || '-'}</span>
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleToggleActive(member)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg transition-all border-2 border-[#B64847] text-[#B64847] hover:bg-[#B64847] hover:text-white"
                >
                  {member.isActive
                    ? `🔴 ${t('admin.team.deactivate', 'Deactivate')}`
                    : `🟢 ${t('admin.team.activate', 'Activate')}`}
                </button>

                <Link
                  href={`/admin/team/${member.id}/edit`}
                  className="block w-full px-3 py-2 text-xs font-bold text-center rounded-lg bg-[#B64847] text-white hover:bg-[#303030] transition-all"
                >
                  ✏️ {getTranslation(translations.common.edit, language)}
                </Link>

                <button
                  onClick={() => setDeleteConfirm({ show: true, id: member.id })}
                  className="w-full px-3 py-2 text-xs font-bold text-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  🗑️ {getTranslation(translations.common.delete, language)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={t('admin.team.deleteTitle', 'Delete Member')}
        message={t('admin.team.deleteMessage', 'Are you sure you want to remove this team member?')}
        confirmText={getTranslation(translations.common.delete, language)}
        cancelText={getTranslation(translations.common.cancel, language)}
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
