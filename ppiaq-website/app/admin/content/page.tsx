'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

interface ContentItem {
  id: string;
  key: string;
  section: string;
  type: string;
}

const pages = ['home', 'about', 'membership', 'visi-misi', 'contact'];

export default function ContentManagementPage() {
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [selectedPage, setSelectedPage] = useState('home');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  useEffect(() => {
    fetchContent();
  }, [selectedPage]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content?page=${selectedPage}`);
      const data = await res.json();
      setContent(data.data || []);
    } catch (error) {
      alert(t('admin.content.failedToFetchContent', 'Failed to fetch content'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContent(content.filter((c) => c.id !== id));
        alert(t('admin.content.contentDeleted', 'Content deleted'));
      }
    } catch (error) {
      alert(t('admin.content.failedToDeleteContent', 'Failed to delete'));
    }
    setDeleteConfirm({ show: false, id: null });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
            {t('admin.content.title', 'Manage Content')}
          </h1>
          <p className="text-[#886644] text-sm">{t('admin.content.description', 'Edit static page content')}</p>
        </div>

        <Link
          href="/admin/content/create"
          className="px-8 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase"
        >
          + {t('admin.content.createContent', 'Create Content')}
        </Link>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPage(p)}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
              selectedPage === p
                ? 'bg-[#B64847] text-white'
                : 'bg-white border border-[#E4DBCA] text-[#886644]'
            }`}
          >
            {p === 'home'
              ? t('admin.content.pages.home', 'Home')
              : p === 'about'
                ? t('admin.content.pages.about', 'About')
                : p === 'membership'
                  ? t('admin.content.pages.membership', 'Membership')
                  : p === 'visi-misi'
                    ? t('admin.content.pages.visiMisi', 'Visi Misi')
                    : t('admin.content.pages.contact', 'Contact')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">{getTranslation(translations.common.loading, language)}</p>
        </div>
      ) : content.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">{t('admin.content.noContent', 'No content yet')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E4DBCA] shadow-sm bg-white">
          <table className="w-full">
            <thead className="bg-[#FFFAF5] border-b border-[#E4DBCA]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#886644]">{getTranslation(translations.common.key, language)}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#886644]">{getTranslation(translations.common.section, language)}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#886644]">{getTranslation(translations.common.type, language)}</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-[#886644]">{getTranslation(translations.common.actions, language)}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4DBCA]">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-[#FFFAF5]">
                  <td className="px-6 py-4 text-sm font-mono text-[#303030]">{item.key}</td>
                  <td className="px-6 py-4 text-sm text-[#303030]">{item.section}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setDeleteConfirm({ show: true, id: item.id })}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700"
                    >
                      {getTranslation(translations.common.delete, language)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={t('admin.content.deleteTitle', 'Delete Content')}
        message={t('admin.content.deleteMessage', 'Sure to delete?')}
        confirmText={getTranslation(translations.common.delete, language)}
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
