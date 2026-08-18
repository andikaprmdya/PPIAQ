'use client';

import { useEffect, useState } from 'react';
import ContentEditModal from '@/components/admin/content/ContentEditModal';
import ImageUploader from '@/components/admin/ImageUploader';
import { useLanguage } from '@/lib/language-context';
import { createTranslator } from '@/lib/translations';
import {
  DEFAULT_PESRA_COMMUNITY_SUPPORTERS,
  DEFAULT_PESRA_SPONSORS,
  PESRA_TEXT_DEFAULTS,
  mergePesraDefaults,
} from '@/lib/pesra-content';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';

type SponsorSize = 'L' | 'M' | 'S';

interface ContentSection {
  id: string;
  key: string;
  section: string;
  content: { id: string; en: string; size?: string; placement?: string };
  image?: string | null;
  type?: string;
  page?: string;
  order?: number;
}

type EntrySection = 'sponsors' | 'community-supporters';

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
  const [entrySection, setEntrySection] = useState<EntrySection>('sponsors');
  const [sponsorPlacement, setSponsorPlacement] = useState<'featured' | 'standard'>('standard');

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
    setEntrySection('sponsors');
    setSponsorPlacement('standard');
    setEditingSponsor(null);
    setIsAddingSponsor(false);
  };

  const openAddSponsorForm = (section: EntrySection) => {
    setSponsorName('');
    setSponsorImage('');
    setSponsorSize('S');
    setEntrySection(section);
    setSponsorPlacement(section === 'sponsors' ? 'standard' : 'standard');
    setEditingSponsor(null);
    setIsAddingSponsor(true);
  };

  const storedSponsorLogos = sections.filter((section) => section.section === 'sponsors');
  const storedSupporters = sections.filter((section) => section.section === 'community-supporters');
  const sponsorLogos = mergePesraDefaults(DEFAULT_PESRA_SPONSORS, storedSponsorLogos);
  const communitySupporters = mergePesraDefaults(DEFAULT_PESRA_COMMUNITY_SUPPORTERS, storedSupporters);

  const getNextEntryOrder = () => {
    const entries = entrySection === 'sponsors' ? sponsorLogos : communitySupporters;
    if (entries.length === 0) return 1;
    return Math.max(...entries.map((entry) => entry.order || 0)) + 1;
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
    setEntrySection(sponsor.section === 'community-supporters' ? 'community-supporters' : 'sponsors');
    setSponsorPlacement(sponsor.content.placement === 'featured' ? 'featured' : 'standard');
    setEditingSponsor(sponsor);
    setIsAddingSponsor(true);
  };

  const handleSaveSponsor = async () => {
    const trimmedName = sponsorName.trim();
    if (!trimmedName || (entrySection === 'sponsors' && !sponsorImage)) {
      alert(
        language === 'id'
          ? entrySection === 'sponsors' ? 'Nama sponsor dan logo wajib diisi' : 'Nama komunitas wajib diisi'
          : entrySection === 'sponsors' ? 'Sponsor name and logo are required' : 'Community name is required'
      );
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
          type: sponsorImage ? 'IMAGE' : 'TEXT',
          content: {
            id: trimmedName,
            en: trimmedName,
            size: sponsorSize,
            placement: entrySection === 'sponsors' ? sponsorPlacement : 'standard',
          },
          image: sponsorImage || undefined,
          page: 'pesta-rakyat',
          section: entrySection,
          order: editingSponsor?.order || getNextEntryOrder(),
        }),
      });

      if (res.ok) {
        await fetchContent();
        resetSponsorForm();
        alert(
          isEditingSponsor
            ? (language === 'id' ? 'Item berhasil diperbarui' : 'Item updated successfully')
            : (language === 'id' ? 'Item berhasil ditambahkan' : 'Item added successfully')
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error || (language === 'id' ? 'Gagal menyimpan logo sponsor' : 'Failed to save sponsor logo'));
      }
    } catch (error) {
      console.error('Error saving Pesra sponsor/community item:', error);
      alert(language === 'id' ? 'Gagal menyimpan item' : 'Failed to save item');
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
        alert(language === 'id' ? 'Item berhasil dihapus' : 'Item deleted successfully');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error || (language === 'id' ? 'Gagal menghapus logo sponsor' : 'Failed to delete sponsor logo'));
      }
    } catch (error) {
      console.error('Error deleting Pesra sponsor/community item:', error);
      alert(language === 'id' ? 'Gagal menghapus item' : 'Failed to delete item');
    }
  };

  const availableSections = [
    { key: 'pesta_event_date', label: 'Event date and location', section: 'hero' },
    { key: 'pesta_event_intro', label: 'Event introduction', section: 'hero' },
    { key: 'pesta_event_description', label: 'Event description', section: 'hero' },
    { key: 'pesta_sponsors_heading', label: 'Sponsor heading', section: 'sponsors' },
    { key: 'pesta_community_heading', label: 'Community supporters heading', section: 'community-supporters' },
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
            const displayContent = existingContent || {
              id: '',
              key: sectionConfig.key,
              section: sectionConfig.section,
              content: PESRA_TEXT_DEFAULTS[sectionConfig.key],
              type: 'TEXT',
              page: 'pesta-rakyat',
            };
            return (
              <div key={sectionConfig.key} className="bg-white border border-[#E4DBCA] rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#B64847] mb-2">{sectionConfig.label}</h3>
                    <p className="text-xs text-[#886644] font-mono mb-3">{sectionConfig.key}</p>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-bold text-[#886644] uppercase mb-1">{t('admin.content.sectionLabels.indonesian', 'Indonesian')}</p>
                        <p className="text-sm text-[#303030] whitespace-pre-line">{displayContent.content.id || t('admin.content.sectionLabels.empty', '(empty)')}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#886644] uppercase mb-1">{t('admin.content.sectionLabels.english', 'English')}</p>
                        <p className="text-sm text-[#303030] whitespace-pre-line">{displayContent.content.en || t('admin.content.sectionLabels.empty', '(empty)')}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditSection(displayContent)}
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
                      {language === 'id' ? 'Sponsor dan Pendukung Komunitas Pesra' : 'Pesra Sponsors and Community Supporters'}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => openAddSponsorForm('sponsors')}
                    disabled={isAddingSponsor}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {language === 'id' ? 'Tambah Sponsor' : 'Add Sponsor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAddSponsorForm('community-supporters')}
                    disabled={isAddingSponsor}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-sm uppercase disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {language === 'id' ? 'Tambah Pendukung' : 'Add Supporter'}
                  </button>
                </div>
              </div>

              {isAddingSponsor && (
                <div className="mb-6 rounded-2xl border border-[#E4DBCA] bg-[#FFFAF5] p-5">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h3 className="font-bold text-[#303030]">
                      {editingSponsor
                        ? (language === 'id' ? 'Edit item Pesra' : 'Edit Pesra item')
                        : entrySection === 'sponsors'
                          ? (language === 'id' ? 'Sponsor baru' : 'New sponsor')
                          : (language === 'id' ? 'Pendukung komunitas baru' : 'New community supporter')}
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
                    {entrySection === 'sponsors'
                      ? (language === 'id' ? 'Nama Sponsor' : 'Sponsor Name')
                      : (language === 'id' ? 'Nama Pendukung' : 'Supporter Name')}
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(event) => setSponsorName(event.target.value)}
                    placeholder={entrySection === 'sponsors' ? (language === 'id' ? 'mis. Nama sponsor' : 'e.g., Sponsor name') : (language === 'id' ? 'mis. Nama komunitas' : 'e.g., Community name')}
                    className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847] mb-5 text-[#303030] placeholder:text-[#886644]"
                  />

                  <ImageUploader
                    value={sponsorImage}
                    onChange={setSponsorImage}
                    category="general"
                    maxSizeMB={5}
                  />

                  {entrySection === 'community-supporters' && (
                    <p className="mb-5 text-xs text-[#886644]">
                      {language === 'id' ? 'Logo opsional; item dapat ditampilkan sebagai teks saja.' : 'Logo optional; this item can be displayed as text only.'}
                    </p>
                  )}

                  {entrySection === 'sponsors' && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
                        {language === 'id' ? 'Penempatan' : 'Placement'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['featured', 'standard'] as const).map((placement) => (
                          <button
                            key={placement}
                            type="button"
                            onClick={() => setSponsorPlacement(placement)}
                            className={`px-4 py-3 rounded-xl border-2 text-center transition-all ${sponsorPlacement === placement ? 'bg-[#B64847] border-[#B64847] text-white' : 'bg-white border-[#E4DBCA] text-[#303030] hover:border-[#B64847]'}`}
                          >
                            <span className="block text-sm font-black uppercase">{placement}</span>
                            <span className="block text-[10px] opacity-80">
                              {placement === 'featured'
                                ? (language === 'id' ? 'Logo utama di atas' : 'Logo featured at top')
                                : (language === 'id' ? 'Baris sponsor' : 'Sponsor row')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
                          ? (language === 'id' ? 'Perbarui Item' : 'Update Item')
                          : (language === 'id' ? 'Simpan Item' : 'Save Item')}
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

              <div className="mb-8">
                <h3 className="font-bold text-lg text-[#B64847] mb-3">
                  {language === 'id' ? 'Sponsor utama' : 'Main sponsors'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sponsorLogos.map((sponsor) => {
                    const sponsorLabel = getSponsorLabel(sponsor);
                    const sponsorSizeValue = getSponsorSize(sponsor);

                    return (
                      <div key={sponsor.key} className="rounded-xl border border-[#E4DBCA] bg-[#FFFAF5] p-4">
                        <div className="h-28 rounded-lg border border-[#E4DBCA] bg-white p-4 flex items-center justify-center mb-4">
                          {sponsor.image ? (
                            <img src={sponsor.image} alt={sponsorLabel} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-[#886644]">
                              {language === 'id' ? 'Tanpa Logo' : 'No Logo'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="font-bold text-[#303030]">{sponsorLabel}</p>
                          <span className="shrink-0 rounded-full bg-[#FEB602]/25 px-3 py-1 text-xs font-black text-[#B64847]">
                            {sponsor.content.placement === 'featured' ? 'Featured' : sponsorSizeValue}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEditSponsor(sponsor)} className="inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 bg-[#B64847] text-white rounded-lg hover:bg-[#303030] transition-all text-xs font-bold uppercase">
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            {language === 'id' ? 'Edit' : 'Edit'}
                          </button>
                          {sponsor.id && (
                            <button type="button" onClick={() => handleDeleteSponsor(sponsor)} className="inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold uppercase">
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              {language === 'id' ? 'Hapus' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#B64847] mb-3">
                  {language === 'id' ? 'Pendukung komunitas' : 'Community supporters'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communitySupporters.map((supporter) => {
                    const supporterLabel = getSponsorLabel(supporter);

                    return (
                      <div key={supporter.key} className="rounded-xl border border-[#E4DBCA] bg-[#FFFAF5] p-4">
                        <div className="h-28 rounded-lg border border-[#E4DBCA] bg-white p-4 flex items-center justify-center mb-4">
                          {supporter.image ? (
                            <img src={supporter.image} alt={supporterLabel} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-[#886644] text-center">
                              {language === 'id' ? 'Teks saja' : 'Text only'}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-[#303030] mb-3">{supporterLabel}</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEditSponsor(supporter)} className="inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 bg-[#B64847] text-white rounded-lg hover:bg-[#303030] transition-all text-xs font-bold uppercase">
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            {language === 'id' ? 'Edit' : 'Edit'}
                          </button>
                          {supporter.id && (
                            <button type="button" onClick={() => handleDeleteSponsor(supporter)} className="inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold uppercase">
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              {language === 'id' ? 'Hapus' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
