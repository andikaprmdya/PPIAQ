'use client';

import { useEffect, useState } from 'react';
import ContentEditModal from '@/components/admin/content/ContentEditModal';
import ImageUploader from '@/components/admin/ImageUploader';
import { useLanguage } from '@/lib/language-context';
import { createTranslator } from '@/lib/translations';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';

type SponsorSize = 'L' | 'M' | 'S';

interface ContentSection {
  id: string;
  key: string;
  section: string;
  content: { id: string; en: string; size?: string };
  image?: string;
  type: string;
  page: string;
  order?: number;
}

const SPONSOR_SIZE_OPTIONS: Array<{ value: SponsorSize; label: string; hint: { id: string; en: string } }> = [
  { value: 'L', label: 'L', hint: { id: 'Besar', en: 'Large' } },
  { value: 'M', label: 'M', hint: { id: 'Sedang', en: 'Medium' } },
  { value: 'S', label: 'S', hint: { id: 'Kecil', en: 'Small' } },
];

const normalizeSponsorName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const isKjriSydneySponsor = (name: string) => {
  const normalized = normalizeSponsorName(name);
  return normalized.includes('kjri sydney') || normalized.includes('konsulat jenderal sydney');
};

export default function PestaRakyatContentPage() {
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingSponsor, setIsAddingSponsor] = useState(false);
  const [isSavingSponsor, setIsSavingSponsor] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<ContentSection | null>(null);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorImage, setSponsorImage] = useState('');
  const [sponsorSize, setSponsorSize] = useState<SponsorSize>('S');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content?page=pesta-rakyat');
      const data = await res.json();
      setSections(data.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      alert(t('admin.content.failedToFetchContent', 'Failed to fetch content'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (section: ContentSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSaveSection = async (updatedData: Record<string, unknown>) => {
    if (!editingSection) return;

    const isExistingContent = Boolean(editingSection.id);
    const endpoint = isExistingContent ? `/api/admin/content/${editingSection.id}` : '/api/admin/content';
    const method = isExistingContent ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          key: editingSection.key,
          type: editingSection.type || 'TEXT',
          page: editingSection.page,
          section: editingSection.section,
          order: editingSection.order || 999,
        }),
      });

      if (res.ok) {
        fetchContent();
        setIsModalOpen(false);
        setEditingSection(null);
        alert(t('admin.content.contentUpdatedSuccessfully', 'Content updated successfully'));
      } else {
        alert(t('admin.content.failedToUpdateContent', 'Failed to update content'));
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert(t('admin.content.failedToSaveContent', 'Failed to save content'));
    }
  };

  const resetSponsorForm = () => {
    setSponsorName('');
    setSponsorImage('');
    setSponsorSize('S');
    setEditingSponsor(null);
    setIsAddingSponsor(false);
  };

  const openAddSponsorForm = () => {
    setSponsorName('');
    setSponsorImage('');
    setSponsorSize('S');
    setEditingSponsor(null);
    setIsAddingSponsor(true);
  };

  const sponsorLogos = sections
    .filter((section) => section.section === 'sponsors')
    .sort((a, b) => (a.order || 999) - (b.order || 999));

  const getNextSponsorOrder = () => {
    if (sponsorLogos.length === 0) return 1;
    return Math.max(...sponsorLogos.map((sponsor) => sponsor.order || 0)) + 1;
  };

  const createSponsorKey = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `pesta_sponsor_${crypto.randomUUID()}`;
    }

    return `pesta_sponsor_${Date.now()}`;
  };

  const getSponsorLabel = (sponsor: ContentSection) => (
    sponsor.content[language] || sponsor.content.en || sponsor.content.id || 'Sponsor'
  );

  const getSponsorSize = (sponsor: ContentSection): SponsorSize => {
    const rawSize = sponsor.content.size?.toUpperCase();
    if (rawSize === 'L' || rawSize === 'M' || rawSize === 'S') return rawSize;
    return isKjriSydneySponsor(getSponsorLabel(sponsor)) ? 'L' : 'S';
  };

  const handleEditSponsor = (sponsor: ContentSection) => {
    setSponsorName(getSponsorLabel(sponsor));
    setSponsorImage(sponsor.image || '');
    setSponsorSize(getSponsorSize(sponsor));
    setEditingSponsor(sponsor);
    setIsAddingSponsor(true);
  };

  const handleSaveSponsor = async () => {
    const trimmedName = sponsorName.trim();
    if (!trimmedName || !sponsorImage) {
      alert(language === 'id' ? 'Nama sponsor dan logo wajib diisi' : 'Sponsor name and logo are required');
      return;
    }

    setIsSavingSponsor(true);
    try {
      const isEditingSponsor = Boolean(editingSponsor?.id);
      const res = await fetch(isEditingSponsor ? `/api/admin/content/${editingSponsor?.id}` : '/api/admin/content', {
        method: isEditingSponsor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editingSponsor?.key || createSponsorKey(),
          type: 'IMAGE',
          content: { id: trimmedName, en: trimmedName, size: sponsorSize },
          image: sponsorImage,
          page: 'pesta-rakyat',
          section: 'sponsors',
          order: editingSponsor?.order || getNextSponsorOrder(),
        }),
      });

      if (res.ok) {
        await fetchContent();
        resetSponsorForm();
        alert(
          isEditingSponsor
            ? (language === 'id' ? 'Logo sponsor berhasil diperbarui' : 'Sponsor logo updated successfully')
            : (language === 'id' ? 'Logo sponsor berhasil ditambahkan' : 'Sponsor logo added successfully')
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error || (language === 'id' ? 'Gagal menyimpan logo sponsor' : 'Failed to save sponsor logo'));
      }
    } catch (error) {
      console.error('Error saving sponsor logo:', error);
      alert(language === 'id' ? 'Gagal menyimpan logo sponsor' : 'Failed to save sponsor logo');
    } finally {
      setIsSavingSponsor(false);
    }
  };

  const handleDeleteSponsor = async (sponsor: ContentSection) => {
    const sponsorLabel = sponsor.content[language] || sponsor.content.en || sponsor.content.id || 'Sponsor';
    const confirmed = confirm(
      language === 'id'
        ? `Hapus logo sponsor "${sponsorLabel}"?`
        : `Delete sponsor logo "${sponsorLabel}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/content/${sponsor.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchContent();
        alert(language === 'id' ? 'Logo sponsor berhasil dihapus' : 'Sponsor logo deleted successfully');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error || (language === 'id' ? 'Gagal menghapus logo sponsor' : 'Failed to delete sponsor logo'));
      }
    } catch (error) {
      console.error('Error deleting sponsor logo:', error);
      alert(language === 'id' ? 'Gagal menghapus logo sponsor' : 'Failed to delete sponsor logo');
    }
  };

  const availableSections = [
    { key: 'pesta_title', label: 'Pesta Rakyat Title', section: 'hero' },
    { key: 'pesta_description', label: 'Pesta Rakyat Description', section: 'hero' },
    { key: 'pesta_schedule_title', label: 'Schedule Title', section: 'schedule' },
    { key: 'pesta_schedule_content', label: 'Schedule Content', section: 'schedule' },
    { key: 'pesta_highlights_title', label: 'Highlights Title', section: 'highlights' },
    { key: 'pesta_highlights_content', label: 'Highlights Content', section: 'highlights' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
          {t('admin.content.pageEditor.pestaTitle', 'Pesta Rakyat Page Content')}
        </h1>
        <p className="text-[#886644] text-sm">{t('admin.content.pageEditor.pestaDescription', 'Edit sections of your Pesta Rakyat page with bilingual support')}</p>
      </div>

      {/* Content Sections */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644]">{t('admin.content.pageEditor.loadingContent', 'Loading content...')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableSections.map((sectionConfig) => {
            const existingContent = sections.find((s) => s.key === sectionConfig.key);
            return (
              <div key={sectionConfig.key} className="bg-white border border-[#E4DBCA] rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#B64847] mb-2">{sectionConfig.label}</h3>
                    <p className="text-xs text-[#886644] font-mono mb-3">{sectionConfig.key}</p>

                    {existingContent ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-bold text-[#886644] uppercase mb-1">{t('admin.content.sectionLabels.indonesian', 'Indonesian')}</p>
                          <p className="text-sm text-[#303030]">{existingContent.content.id || t('admin.content.sectionLabels.empty', '(empty)')}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#886644] uppercase mb-1">{t('admin.content.sectionLabels.english', 'English')}</p>
                          <p className="text-sm text-[#303030]">{existingContent.content.en || t('admin.content.sectionLabels.empty', '(empty)')}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#886644] italic">{t('admin.content.sectionLabels.noContentYet', 'No content set yet')}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditSection(existingContent || { id: '', key: sectionConfig.key, section: sectionConfig.section, content: { id: '', en: '' }, type: 'TEXT', page: 'pesta-rakyat' })}
                    className="ml-4 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase whitespace-nowrap"
                  >
                    {existingContent
                      ? t('admin.content.sectionLabels.edit', 'Edit')
                      : t('admin.content.sectionLabels.create', 'Create')}
                  </button>
                </div>
              </div>
            );
          })}

          <section className="pt-6">
            <div className="bg-white border border-[#E4DBCA] rounded-2xl p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ImagePlus className="w-5 h-5 text-[#B64847]" aria-hidden="true" />
                    <h2 className="font-bold text-xl text-[#B64847]">
                      {language === 'id' ? 'Logo Sponsor Pesra' : 'Pesra Sponsor Logos'}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openAddSponsorForm}
                  disabled={isAddingSponsor}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  {language === 'id' ? 'Tambah Logo Sponsor' : 'Add Sponsor Logo'}
                </button>
              </div>

              {isAddingSponsor && (
                <div className="mb-6 rounded-2xl border border-[#E4DBCA] bg-[#FFFAF5] p-5">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h3 className="font-bold text-[#303030]">
                      {editingSponsor
                        ? (language === 'id' ? 'Edit logo sponsor' : 'Edit sponsor logo')
                        : (language === 'id' ? 'Logo sponsor baru' : 'New sponsor logo')}
                    </h3>
                    <button
                      type="button"
                      onClick={resetSponsorForm}
                      disabled={isSavingSponsor}
                      className="p-2 text-[#886644] hover:text-[#B64847] disabled:opacity-50"
                      aria-label={language === 'id' ? 'Tutup formulir sponsor' : 'Close sponsor form'}
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>

                  <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
                    {language === 'id' ? 'Nama Sponsor' : 'Sponsor Name'}
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(event) => setSponsorName(event.target.value)}
                    placeholder={language === 'id' ? 'mis. Tuya Taste' : 'e.g., Tuya Taste'}
                    className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847] mb-5 text-[#303030] placeholder:text-[#886644]"
                  />

                  <ImageUploader
                    value={sponsorImage}
                    onChange={setSponsorImage}
                    category="general"
                    maxSizeMB={5}
                  />

                  <div className="mb-6">
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
                      {language === 'id' ? 'Ukuran Logo' : 'Logo Size'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {SPONSOR_SIZE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSponsorSize(option.value)}
                          className={`
                            px-4 py-3 rounded-xl border-2 text-center transition-all
                            ${sponsorSize === option.value
                              ? 'bg-[#B64847] border-[#B64847] text-white'
                              : 'bg-white border-[#E4DBCA] text-[#303030] hover:border-[#B64847]'
                            }
                          `}
                        >
                          <span className="block text-lg font-black">{option.label}</span>
                          <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80">
                            {option.hint[language]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleSaveSponsor}
                      disabled={isSavingSponsor}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      {isSavingSponsor
                        ? (language === 'id' ? 'Menyimpan...' : 'Saving...')
                        : editingSponsor
                          ? (language === 'id' ? 'Perbarui Logo' : 'Update Logo')
                          : (language === 'id' ? 'Simpan Logo' : 'Save Logo')}
                    </button>
                    <button
                      type="button"
                      onClick={resetSponsorForm}
                      disabled={isSavingSponsor}
                      className="px-5 py-3 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-sm uppercase disabled:opacity-50"
                    >
                      {language === 'id' ? 'Batal' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              {sponsorLogos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4DBCA] p-8 text-center text-sm text-[#886644]">
                  {language === 'id'
                    ? 'Belum ada logo sponsor. Klik tombol tambah untuk menampilkan sponsor di website.'
                    : 'No sponsor logos yet. Click add to show sponsors on the website.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sponsorLogos.map((sponsor) => {
                    const sponsorLabel = getSponsorLabel(sponsor);
                    const sponsorSizeValue = getSponsorSize(sponsor);

                    return (
                      <div key={sponsor.id} className="rounded-xl border border-[#E4DBCA] bg-[#FFFAF5] p-4">
                        <div className="h-28 rounded-lg border border-[#E4DBCA] bg-white p-4 flex items-center justify-center mb-4">
                          {sponsor.image ? (
                            <img
                              src={sponsor.image}
                              alt={sponsorLabel}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-[#886644]">
                              {language === 'id' ? 'Tanpa Logo' : 'No Logo'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="font-bold text-[#303030]">{sponsorLabel}</p>
                          <span className="shrink-0 rounded-full bg-[#FEB602]/25 px-3 py-1 text-xs font-black text-[#B64847]">
                            {sponsorSizeValue}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditSponsor(sponsor)}
                            className="inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 bg-[#B64847] text-white rounded-lg hover:bg-[#303030] transition-all text-xs font-bold uppercase"
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            {language === 'id' ? 'Edit' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSponsor(sponsor)}
                            className="inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold uppercase"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            {language === 'id' ? 'Hapus' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingSection && (
        <ContentEditModal
          section={editingSection}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSection(null);
          }}
          onSave={handleSaveSection}
        />
      )}
    </div>
  );
}
