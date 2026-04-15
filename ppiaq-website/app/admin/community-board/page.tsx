'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

type BilingualField = { id: string; en: string };

// ── Defined OUTSIDE component to prevent remount on every render ──
const inputClass = 'w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847] text-[#303030]';
const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1';

function BilingualInput({
  label,
  value,
  onChange,
  englishLabel,
  indonesianLabel,
  englishPlaceholder,
  indonesianPlaceholder,
}: {
  label: string;
  value: BilingualField;
  onChange: (v: BilingualField) => void;
  englishLabel: string;
  indonesianLabel: string;
  englishPlaceholder: string;
  indonesianPlaceholder: string;
}) {
  return (
    <div className="space-y-2">
      <p className={labelClass}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] font-bold text-[#886644] mb-1">{englishLabel}</p>
          <input className={inputClass} placeholder={englishPlaceholder} value={value.en} onChange={e => onChange({ ...value, en: e.target.value })} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-[#886644] mb-1">{indonesianLabel}</p>
          <input className={inputClass} placeholder={indonesianPlaceholder} value={value.id} onChange={e => onChange({ ...value, id: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function BilingualTextarea({
  label,
  value,
  onChange,
  englishLabel,
  indonesianLabel,
  englishPlaceholder,
  indonesianPlaceholder,
}: {
  label: string;
  value: BilingualField;
  onChange: (v: BilingualField) => void;
  englishLabel: string;
  indonesianLabel: string;
  englishPlaceholder: string;
  indonesianPlaceholder: string;
}) {
  return (
    <div className="space-y-2">
      <p className={labelClass}>{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] font-bold text-[#886644] mb-1">{englishLabel}</p>
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            placeholder={englishPlaceholder}
            value={value.en}
            onChange={e => onChange({ ...value, en: e.target.value })}
          />
        </div>
        <div>
          <p className="text-[9px] font-bold text-[#886644] mb-1">{indonesianLabel}</p>
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            placeholder={indonesianPlaceholder}
            value={value.id}
            onChange={e => onChange({ ...value, id: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

interface Discount {
  id: string;
  name: BilingualField;
  description: BilingualField;
  code: string;
  validUntil: string;
  isActive: boolean;
  order: number;
}

interface Resource {
  id: string;
  category: BilingualField;
  name: BilingualField;
  location: string;
  isActive: boolean;
  order: number;
}

interface Announcement {
  id: string;
  title: BilingualField;
  description: BilingualField;
  date: string;
  isActive: boolean;
  order: number;
}

type Tab = 'discounts' | 'resources' | 'announcements';

const emptyBilingual = (): BilingualField => ({ id: '', en: '' });
const RESOURCE_CATEGORY_OPTIONS: BilingualField[] = [
  { en: 'Apartment', id: 'Apartemen' },
  { en: 'Housing', id: 'Perumahan' },
  { en: 'Accommodation & Housing', id: 'Akomodasi & Perumahan' },
  { en: 'Restaurants & Cafes', id: 'Restoran & Kafe' },
  { en: 'Learning Resources', id: 'Sumber Belajar' },
  { en: 'Transport & Mobility', id: 'Transportasi & Mobilitas' },
  { en: 'Health & Wellness', id: 'Kesehatan & Kebugaran' },
];

export default function AdminCommunityBoardPage() {
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [activeTab, setActiveTab] = useState<Tab>('discounts');

  // Discounts state
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discountForm, setDiscountForm] = useState({
    name: emptyBilingual(),
    description: emptyBilingual(),
    code: '',
    validUntil: '',
    isActive: true,
    order: 0,
  });

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    category: emptyBilingual(),
    name: emptyBilingual(),
    location: '',
    isActive: true,
    order: 0,
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: emptyBilingual(),
    description: emptyBilingual(),
    date: '',
    isActive: true,
    order: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const discountFormRef = useRef<HTMLDivElement | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Fetch all data
  useEffect(() => {
    fetchDiscounts();
    fetchResources();
    fetchAnnouncements();
  }, []);

  const fetchDiscounts = async () => {
    const res = await fetch('/api/admin/community-board/discounts');
    if (res.ok) setDiscounts(await res.json());
  };

  const fetchResources = async () => {
    const res = await fetch('/api/admin/community-board/resources', { cache: 'no-store' });
    if (res.ok) setResources(await res.json());
  };

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/admin/community-board/announcements');
    if (res.ok) setAnnouncements(await res.json());
  };

  // ── PARTNER BENEFITS ───────────────────────────────────────────
  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDiscount) {
        const res = await fetch(`/api/admin/community-board/discounts?id=${editingDiscount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discountForm),
        });
        if (res.ok) {
          showMessage('success', t('admin.communityBoard.discount.updated', 'Discount updated!'));
          fetchDiscounts();
          setEditingDiscount(null);
          setDiscountForm({ name: emptyBilingual(), description: emptyBilingual(), code: '', validUntil: '', isActive: true, order: 0 });
        } else showMessage('error', t('admin.crud.failedToUpdate', 'Failed to update data'));
      } else {
        const res = await fetch('/api/admin/community-board/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discountForm),
        });
        if (res.ok) {
          showMessage('success', t('admin.communityBoard.discount.added', 'Discount added!'));
          fetchDiscounts();
          setDiscountForm({ name: emptyBilingual(), description: emptyBilingual(), code: '', validUntil: '', isActive: true, order: 0 });
        } else showMessage('error', t('admin.crud.failedToCreate', 'Failed to create data'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm(t('admin.communityBoard.discount.deleteConfirm', 'Delete this discount?'))) return;
    const res = await fetch(`/api/admin/community-board/discounts?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('success', t('admin.communityBoard.discount.deleted', 'Discount deleted!')); fetchDiscounts(); }
    else showMessage('error', t('admin.crud.failedToDelete', 'Failed to delete data'));
  };

  const startEditDiscount = (d: Discount) => {
    setEditingDiscount(d);
    setDiscountForm({ name: d.name, description: d.description, code: d.code, validUntil: d.validUntil, isActive: d.isActive, order: d.order });
    requestAnimationFrame(() => {
      discountFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // ── RESOURCES ──────────────────────────────────────────────────
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingResource) {
        const res = await fetch(`/api/admin/community-board/resources?id=${editingResource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceForm),
        });
        if (res.ok) {
          showMessage('success', t('admin.communityBoard.resource.updated', 'Resource updated!'));
          fetchResources();
          setEditingResource(null);
          setResourceForm({ category: emptyBilingual(), name: emptyBilingual(), location: '', isActive: true, order: 0 });
        } else showMessage('error', t('admin.crud.failedToUpdate', 'Failed to update data'));
      } else {
        const res = await fetch('/api/admin/community-board/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceForm),
        });
        if (res.ok) {
          showMessage('success', t('admin.communityBoard.resource.added', 'Resource added!'));
          fetchResources();
          setResourceForm({ category: emptyBilingual(), name: emptyBilingual(), location: '', isActive: true, order: 0 });
        } else showMessage('error', t('admin.crud.failedToCreate', 'Failed to create data'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm(t('admin.communityBoard.resource.deleteConfirm', 'Delete this resource?'))) return;
    const res = await fetch(`/api/admin/community-board/resources?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('success', t('admin.communityBoard.resource.deleted', 'Resource deleted!')); fetchResources(); }
    else showMessage('error', t('admin.crud.failedToDelete', 'Failed to delete data'));
  };

  const handleToggleResourceActive = async (resource: Resource) => {
    const nextIsActive = !resource.isActive;
    const res = await fetch(`/api/admin/community-board/resources?id=${resource.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...resource, isActive: nextIsActive }),
    });

    if (res.ok) {
      showMessage(
        'success',
        nextIsActive
          ? t('admin.communityBoard.resource.activated', 'Resource activated!')
          : t('admin.communityBoard.resource.deactivated', 'Resource deactivated!')
      );
      fetchResources();
      if (editingResource?.id === resource.id) {
        setEditingResource({ ...resource, isActive: nextIsActive });
        setResourceForm((prev) => ({ ...prev, isActive: nextIsActive }));
      }
    } else {
      showMessage('error', t('admin.crud.failedToUpdate', 'Failed to update data'));
    }
  };

  const startEditResource = (r: Resource) => {
    setEditingResource(r);
    setResourceForm({ category: r.category, name: r.name, location: r.location, isActive: r.isActive, order: r.order });
  };
  const isKnownResourceCategory = RESOURCE_CATEGORY_OPTIONS.some((option) => option.en === resourceForm.category.en);
  const handleResourceCategoryChange = (nextEnLabel: string) => {
    const selectedCategory = RESOURCE_CATEGORY_OPTIONS.find((option) => option.en === nextEnLabel);
    if (!selectedCategory) return;
    setResourceForm((form) => ({ ...form, category: selectedCategory }));
  };

  // ── ANNOUNCEMENTS ──────────────────────────────────────────────
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAnnouncement) {
        const res = await fetch(`/api/admin/community-board/announcements?id=${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementForm),
        });
        if (res.ok) {
          showMessage('success', t('admin.communityBoard.announcement.updated', 'Announcement updated!'));
          fetchAnnouncements();
          setEditingAnnouncement(null);
          setAnnouncementForm({ title: emptyBilingual(), description: emptyBilingual(), date: '', isActive: true, order: 0 });
        } else showMessage('error', t('admin.crud.failedToUpdate', 'Failed to update data'));
      } else {
        const res = await fetch('/api/admin/community-board/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementForm),
        });
        if (res.ok) {
          showMessage('success', t('admin.communityBoard.announcement.added', 'Announcement added!'));
          fetchAnnouncements();
          setAnnouncementForm({ title: emptyBilingual(), description: emptyBilingual(), date: '', isActive: true, order: 0 });
        } else showMessage('error', t('admin.crud.failedToCreate', 'Failed to create data'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm(t('admin.communityBoard.announcement.deleteConfirm', 'Delete this announcement?'))) return;
    const res = await fetch(`/api/admin/community-board/announcements?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('success', t('admin.communityBoard.announcement.deleted', 'Announcement deleted!')); fetchAnnouncements(); }
    else showMessage('error', t('admin.crud.failedToDelete', 'Failed to delete data'));
  };

  const startEditAnnouncement = (a: Announcement) => {
    setEditingAnnouncement(a);
    setAnnouncementForm({ title: a.title, description: a.description, date: a.date, isActive: a.isActive, order: a.order });
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['discounts', 'resources', 'announcements'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-[#B64847] text-white' : 'border-2 border-[#E4DBCA] text-[#B64847] hover:border-[#B64847]'
            }`}
          >
            {tab === 'discounts'
              ? `${t('admin.communityBoard.tabs.discounts', 'Discounts')} (${discounts.length})`
              : tab === 'resources'
                ? `${t('admin.communityBoard.tabs.resources', 'Resources')} (${resources.length})`
                : `${t('admin.communityBoard.tabs.announcements', 'Announcements')} (${announcements.length})`}
          </button>
        ))}
      </div>

      {/* ── DISCOUNTS TAB ── */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div ref={discountFormRef} className="bg-white rounded-2xl border border-[#E4DBCA] p-6">
            <h3 className="font-bold text-lg text-[#B64847] mb-4">
              {editingDiscount ? t('admin.communityBoard.discount.edit', 'Edit Partner Entry') : t('admin.communityBoard.discount.add', 'Add Partner Entry')}
            </h3>
            <form onSubmit={handleDiscountSubmit} className="space-y-4">
              <BilingualInput
                label={t('admin.communityBoard.discount.partnerName', 'Partner Name')}
                value={discountForm.name}
                onChange={v => setDiscountForm(f => ({ ...f, name: v }))}
                englishLabel={getTranslation(translations.bilingualInput.english, language)}
                indonesianLabel={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
                englishPlaceholder={t('admin.communityBoard.discount.partnerNamePlaceholderEn', 'e.g. RACC')}
                indonesianPlaceholder={t('admin.communityBoard.discount.partnerNamePlaceholderId', 'mis. RACC')}
              />
              <BilingualTextarea
                label={t('admin.communityBoard.discount.benefits', 'Benefits for PPIAQ')}
                value={discountForm.description}
                onChange={v => setDiscountForm(f => ({ ...f, description: v }))}
                englishLabel={getTranslation(translations.bilingualInput.english, language)}
                indonesianLabel={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
                englishPlaceholder={t('admin.communityBoard.discount.benefitsPlaceholderEn', 'Write partner benefits for PPIAQ')}
                indonesianPlaceholder={t('admin.communityBoard.discount.benefitsPlaceholderId', 'Tulis benefit partner untuk PPIAQ')}
              />
              <div>
                <label className={labelClass}>{t('admin.communityBoard.discount.code', 'Partnership Obligation')}</label>
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder={t('admin.communityBoard.discount.codePlaceholder', 'Write obligations agreed with the partner')}
                  value={discountForm.code}
                  onChange={e => setDiscountForm(f => ({ ...f, code: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>{t('admin.communityBoard.discount.validUntil', 'Contract End Date')}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder={t('admin.communityBoard.discount.validUntilPlaceholder', 'e.g. May 1, 2028')}
                  value={discountForm.validUntil}
                  onChange={e => setDiscountForm(f => ({ ...f, validUntil: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="discountActive" checked={discountForm.isActive} onChange={e => setDiscountForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="discountActive" className="text-sm font-bold text-[#886644]">{t('admin.communityBoard.activeLabel', 'Active')}</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#303030] transition-all disabled:opacity-50">
                  {loading ? getTranslation(translations.common.processing, language) : editingDiscount ? getTranslation(translations.common.update, language) : getTranslation(translations.common.add, language)}
                </button>
                {editingDiscount && (
                  <button type="button" onClick={() => { setEditingDiscount(null); setDiscountForm({ name: emptyBilingual(), description: emptyBilingual(), code: '', validUntil: '', isActive: true, order: 0 }); }}
                    className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] font-bold rounded-xl text-xs uppercase hover:border-[#B64847] transition-all">
                    {getTranslation(translations.common.cancel, language)}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {discounts.length === 0 && <p className="text-gray-400 text-sm">{t('admin.communityBoard.discount.noData', 'No partner entries yet. Add one!')}</p>}
            {discounts.map(d => (
              <div key={d.id} className={`bg-white rounded-2xl border p-4 ${d.isActive ? 'border-[#FEB602]' : 'border-[#E4DBCA] opacity-60'}`}>
                <div className="mb-3">
                  <p className="font-bold text-[#B64847] text-base">{language === 'id' ? d.name.id : d.name.en}</p>
                </div>
                <div className="space-y-3 mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {t('admin.communityBoard.discount.benefitsLabel', 'Benefits for PPIAQ')}
                    </p>
                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{language === 'id' ? d.description.id : d.description.en}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1">
                      {t('admin.communityBoard.discount.obligationLabel', 'Partnership Obligation')}
                    </p>
                    <p className="text-xs text-[#B64847] font-semibold whitespace-pre-line leading-relaxed">{d.code}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">
                  {t('admin.communityBoard.discount.validUntilLabel', 'Contract end date:')} {d.validUntil} · {d.isActive ? `✅ ${t('admin.communityBoard.statusActive', 'Active')}` : `❌ ${t('admin.communityBoard.statusInactive', 'Inactive')}`}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => startEditDiscount(d)} className="px-3 py-1 bg-[#FFFAF5] border border-[#E4DBCA] text-[#B64847] font-bold rounded-lg text-xs hover:border-[#B64847] transition-all">{getTranslation(translations.common.edit, language)}</button>
                  <button onClick={() => handleDeleteDiscount(d.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100 transition-all">{getTranslation(translations.common.delete, language)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESOURCES TAB ── */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E4DBCA] p-6">
            <h3 className="font-bold text-lg text-[#B64847] mb-4">
              {editingResource ? t('admin.communityBoard.resource.edit', 'Edit Resource') : t('admin.communityBoard.resource.add', 'Add Resource')}
            </h3>
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>{t('admin.communityBoard.resource.category', 'Category')}</label>
                <select
                  className={inputClass}
                  value={resourceForm.category.en}
                  onChange={(e) => handleResourceCategoryChange(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    {language === 'id' ? 'Pilih kategori' : 'Select category'}
                  </option>
                  {!isKnownResourceCategory && resourceForm.category.en && (
                    <option value={resourceForm.category.en}>
                      {language === 'id' ? resourceForm.category.id : resourceForm.category.en}
                    </option>
                  )}
                  {RESOURCE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.en} value={option.en}>
                      {language === 'id' ? option.id : option.en}
                    </option>
                  ))}
                </select>
              </div>
              <BilingualInput
                label={getTranslation(translations.common.name, language)}
                value={resourceForm.name}
                onChange={v => setResourceForm(f => ({ ...f, name: v }))}
                englishLabel={getTranslation(translations.bilingualInput.english, language)}
                indonesianLabel={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
                englishPlaceholder={getTranslation(translations.bilingualInput.english, language)}
                indonesianPlaceholder={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
              />
              <div>
                <label className={labelClass}>{getTranslation(translations.common.location, language)}</label>
                <input className={inputClass} placeholder={t('admin.communityBoard.resource.locationPlaceholder', 'e.g. South Bank')} value={resourceForm.location} onChange={e => setResourceForm(f => ({ ...f, location: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="resourceActive" checked={resourceForm.isActive} onChange={e => setResourceForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="resourceActive" className="text-sm font-bold text-[#886644]">{t('admin.communityBoard.activeLabel', 'Active')}</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#303030] transition-all disabled:opacity-50">
                  {loading ? getTranslation(translations.common.processing, language) : editingResource ? getTranslation(translations.common.update, language) : getTranslation(translations.common.add, language)}
                </button>
                {editingResource && (
                  <button type="button" onClick={() => { setEditingResource(null); setResourceForm({ category: emptyBilingual(), name: emptyBilingual(), location: '', isActive: true, order: 0 }); }}
                    className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] font-bold rounded-xl text-xs uppercase hover:border-[#B64847] transition-all">
                    {getTranslation(translations.common.cancel, language)}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {resources.length === 0 && <p className="text-gray-400 text-sm">{t('admin.communityBoard.resource.noData', 'No resources yet. Add one!')}</p>}
            {resources.map(r => (
              <div key={r.id} className={`bg-white rounded-2xl border p-4 ${r.isActive ? 'border-[#E4DBCA]' : 'border-[#E4DBCA] opacity-60'}`}>
                <div className="mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644]">{language === 'id' ? r.category.id : r.category.en}</p>
                  <p className="font-bold text-[#B64847]">{language === 'id' ? r.name.id : r.name.en}</p>
                  <p className="text-xs text-gray-500">📍 {r.location} · {r.isActive ? `✅ ${t('admin.communityBoard.statusActive', 'Active')}` : `❌ ${t('admin.communityBoard.statusInactive', 'Inactive')}`}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEditResource(r)} className="px-3 py-1 bg-[#FFFAF5] border border-[#E4DBCA] text-[#B64847] font-bold rounded-lg text-xs hover:border-[#B64847] transition-all">{getTranslation(translations.common.edit, language)}</button>
                  <button
                    onClick={() => handleToggleResourceActive(r)}
                    className={`px-3 py-1 font-bold rounded-lg text-xs transition-all ${
                      r.isActive
                        ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                        : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {r.isActive
                      ? (language === 'id' ? 'Nonaktifkan' : 'Deactivate')
                      : (language === 'id' ? 'Aktifkan' : 'Activate')}
                  </button>
                  <button onClick={() => handleDeleteResource(r.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100 transition-all">{getTranslation(translations.common.delete, language)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ANNOUNCEMENTS TAB ── */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E4DBCA] p-6">
            <h3 className="font-bold text-lg text-[#B64847] mb-4">
              {editingAnnouncement ? t('admin.communityBoard.announcement.edit', 'Edit Announcement') : t('admin.communityBoard.announcement.add', 'Add Announcement')}
            </h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <BilingualInput
                label={getTranslation(translations.common.title, language)}
                value={announcementForm.title}
                onChange={v => setAnnouncementForm(f => ({ ...f, title: v }))}
                englishLabel={getTranslation(translations.bilingualInput.english, language)}
                indonesianLabel={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
                englishPlaceholder={getTranslation(translations.bilingualInput.english, language)}
                indonesianPlaceholder={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
              />
              <BilingualInput
                label={getTranslation(translations.common.description, language)}
                value={announcementForm.description}
                onChange={v => setAnnouncementForm(f => ({ ...f, description: v }))}
                englishLabel={getTranslation(translations.bilingualInput.english, language)}
                indonesianLabel={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
                englishPlaceholder={getTranslation(translations.bilingualInput.english, language)}
                indonesianPlaceholder={t('admin.communityBoard.indonesianPlaceholder', 'Indonesian')}
              />
              <div>
                <label className={labelClass}>{getTranslation(translations.common.date, language)}</label>
                <input type="date" className={inputClass} value={announcementForm.date} onChange={e => setAnnouncementForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="announcementActive" checked={announcementForm.isActive} onChange={e => setAnnouncementForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="announcementActive" className="text-sm font-bold text-[#886644]">{t('admin.communityBoard.activeLabel', 'Active')}</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#303030] transition-all disabled:opacity-50">
                  {loading ? getTranslation(translations.common.processing, language) : editingAnnouncement ? getTranslation(translations.common.update, language) : getTranslation(translations.common.add, language)}
                </button>
                {editingAnnouncement && (
                  <button type="button" onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ title: emptyBilingual(), description: emptyBilingual(), date: '', isActive: true, order: 0 }); }}
                    className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] font-bold rounded-xl text-xs uppercase hover:border-[#B64847] transition-all">
                    {getTranslation(translations.common.cancel, language)}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {announcements.length === 0 && <p className="text-gray-400 text-sm">{t('admin.communityBoard.announcement.noData', 'No announcements yet. Add one!')}</p>}
            {announcements.map(a => (
              <div key={a.id} className={`bg-white rounded-2xl border p-4 ${a.isActive ? 'border-[#E4DBCA]' : 'border-[#E4DBCA] opacity-60'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[#B64847]">{language === 'id' ? a.title.id : a.title.en}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{a.date}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{language === 'id' ? a.description.id : a.description.en}</p>
                <p className="text-[10px] text-gray-400">{a.isActive ? `✅ ${t('admin.communityBoard.statusActive', 'Active')}` : `❌ ${t('admin.communityBoard.statusInactive', 'Inactive')}`}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEditAnnouncement(a)} className="px-3 py-1 bg-[#FFFAF5] border border-[#E4DBCA] text-[#B64847] font-bold rounded-lg text-xs hover:border-[#B64847] transition-all">{getTranslation(translations.common.edit, language)}</button>
                  <button onClick={() => handleDeleteAnnouncement(a.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100 transition-all">{getTranslation(translations.common.delete, language)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
