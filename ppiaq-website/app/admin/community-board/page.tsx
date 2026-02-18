'use client';

import { useState, useEffect } from 'react';

type BilingualField = { id: string; en: string };

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

export default function AdminCommunityBoardPage() {
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
    const res = await fetch('/api/admin/community-board/resources');
    if (res.ok) setResources(await res.json());
  };

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/admin/community-board/announcements');
    if (res.ok) setAnnouncements(await res.json());
  };

  // ── DISCOUNTS ──────────────────────────────────────────────────
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
          showMessage('success', 'Discount updated!');
          fetchDiscounts();
          setEditingDiscount(null);
          setDiscountForm({ name: emptyBilingual(), description: emptyBilingual(), code: '', validUntil: '', isActive: true, order: 0 });
        } else showMessage('error', 'Failed to update');
      } else {
        const res = await fetch('/api/admin/community-board/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discountForm),
        });
        if (res.ok) {
          showMessage('success', 'Discount added!');
          fetchDiscounts();
          setDiscountForm({ name: emptyBilingual(), description: emptyBilingual(), code: '', validUntil: '', isActive: true, order: 0 });
        } else showMessage('error', 'Failed to add');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Delete this discount?')) return;
    const res = await fetch(`/api/admin/community-board/discounts?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('success', 'Deleted!'); fetchDiscounts(); }
    else showMessage('error', 'Failed to delete');
  };

  const startEditDiscount = (d: Discount) => {
    setEditingDiscount(d);
    setDiscountForm({ name: d.name, description: d.description, code: d.code, validUntil: d.validUntil, isActive: d.isActive, order: d.order });
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
          showMessage('success', 'Resource updated!');
          fetchResources();
          setEditingResource(null);
          setResourceForm({ category: emptyBilingual(), name: emptyBilingual(), location: '', isActive: true, order: 0 });
        } else showMessage('error', 'Failed to update');
      } else {
        const res = await fetch('/api/admin/community-board/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceForm),
        });
        if (res.ok) {
          showMessage('success', 'Resource added!');
          fetchResources();
          setResourceForm({ category: emptyBilingual(), name: emptyBilingual(), location: '', isActive: true, order: 0 });
        } else showMessage('error', 'Failed to add');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    const res = await fetch(`/api/admin/community-board/resources?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('success', 'Deleted!'); fetchResources(); }
    else showMessage('error', 'Failed to delete');
  };

  const startEditResource = (r: Resource) => {
    setEditingResource(r);
    setResourceForm({ category: r.category, name: r.name, location: r.location, isActive: r.isActive, order: r.order });
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
          showMessage('success', 'Announcement updated!');
          fetchAnnouncements();
          setEditingAnnouncement(null);
          setAnnouncementForm({ title: emptyBilingual(), description: emptyBilingual(), date: '', isActive: true, order: 0 });
        } else showMessage('error', 'Failed to update');
      } else {
        const res = await fetch('/api/admin/community-board/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementForm),
        });
        if (res.ok) {
          showMessage('success', 'Announcement added!');
          fetchAnnouncements();
          setAnnouncementForm({ title: emptyBilingual(), description: emptyBilingual(), date: '', isActive: true, order: 0 });
        } else showMessage('error', 'Failed to add');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    const res = await fetch(`/api/admin/community-board/announcements?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showMessage('success', 'Deleted!'); fetchAnnouncements(); }
    else showMessage('error', 'Failed to delete');
  };

  const startEditAnnouncement = (a: Announcement) => {
    setEditingAnnouncement(a);
    setAnnouncementForm({ title: a.title, description: a.description, date: a.date, isActive: a.isActive, order: a.order });
  };

  // ── SHARED UI ──────────────────────────────────────────────────
  const inputClass = 'w-full px-3 py-2 border border-[#E4DBCA] rounded-lg text-sm focus:outline-none focus:border-[#B64847]';
  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-[#886644] mb-1';

  const BilingualInput = ({
    label, value, onChange,
  }: { label: string; value: BilingualField; onChange: (v: BilingualField) => void }) => (
    <div className="space-y-2">
      <p className={labelClass}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-gray-400 mb-1">English</p>
          <input className={inputClass} placeholder="English" value={value.en} onChange={e => onChange({ ...value, en: e.target.value })} />
        </div>
        <div>
          <p className="text-[9px] text-gray-400 mb-1">Indonesia</p>
          <input className={inputClass} placeholder="Indonesia" value={value.id} onChange={e => onChange({ ...value, id: e.target.value })} />
        </div>
      </div>
    </div>
  );

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
            {tab === 'discounts' ? `Discounts (${discounts.length})` : tab === 'resources' ? `Resources (${resources.length})` : `Announcements (${announcements.length})`}
          </button>
        ))}
      </div>

      {/* ── DISCOUNTS TAB ── */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E4DBCA] p-6">
            <h3 className="font-bold text-lg text-[#B64847] mb-4">
              {editingDiscount ? 'Edit Discount' : 'Add Discount'}
            </h3>
            <form onSubmit={handleDiscountSubmit} className="space-y-4">
              <BilingualInput label="Name" value={discountForm.name} onChange={v => setDiscountForm(f => ({ ...f, name: v }))} />
              <BilingualInput label="Description" value={discountForm.description} onChange={v => setDiscountForm(f => ({ ...f, description: v }))} />
              <div>
                <label className={labelClass}>Discount Code</label>
                <input className={inputClass} placeholder="e.g. PPIA20" value={discountForm.code} onChange={e => setDiscountForm(f => ({ ...f, code: e.target.value }))} required />
              </div>
              <div>
                <label className={labelClass}>Valid Until</label>
                <input type="date" className={inputClass} value={discountForm.validUntil} onChange={e => setDiscountForm(f => ({ ...f, validUntil: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="discountActive" checked={discountForm.isActive} onChange={e => setDiscountForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="discountActive" className="text-sm font-bold text-[#886644]">Active</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#303030] transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : editingDiscount ? 'Update' : 'Add'}
                </button>
                {editingDiscount && (
                  <button type="button" onClick={() => { setEditingDiscount(null); setDiscountForm({ name: emptyBilingual(), description: emptyBilingual(), code: '', validUntil: '', isActive: true, order: 0 }); }}
                    className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] font-bold rounded-xl text-xs uppercase hover:border-[#B64847] transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {discounts.length === 0 && <p className="text-gray-400 text-sm">No discounts yet. Add one!</p>}
            {discounts.map(d => (
              <div key={d.id} className={`bg-white rounded-2xl border p-4 ${d.isActive ? 'border-[#FEB602]' : 'border-[#E4DBCA] opacity-60'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-[#B64847]">{d.name.en}</p>
                    <p className="text-xs text-gray-500">{d.description.en}</p>
                  </div>
                  <span className="font-mono font-bold text-sm bg-[#FEB602]/20 text-[#B64847] px-2 py-1 rounded-lg">{d.code}</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">Valid until: {d.validUntil} · {d.isActive ? '✅ Active' : '❌ Inactive'}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEditDiscount(d)} className="px-3 py-1 bg-[#FFFAF5] border border-[#E4DBCA] text-[#B64847] font-bold rounded-lg text-xs hover:border-[#B64847] transition-all">Edit</button>
                  <button onClick={() => handleDeleteDiscount(d.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100 transition-all">Delete</button>
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
              {editingResource ? 'Edit Resource' : 'Add Resource'}
            </h3>
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <BilingualInput label="Category" value={resourceForm.category} onChange={v => setResourceForm(f => ({ ...f, category: v }))} />
              <BilingualInput label="Name" value={resourceForm.name} onChange={v => setResourceForm(f => ({ ...f, name: v }))} />
              <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} placeholder="e.g. South Bank" value={resourceForm.location} onChange={e => setResourceForm(f => ({ ...f, location: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="resourceActive" checked={resourceForm.isActive} onChange={e => setResourceForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="resourceActive" className="text-sm font-bold text-[#886644]">Active</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#303030] transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : editingResource ? 'Update' : 'Add'}
                </button>
                {editingResource && (
                  <button type="button" onClick={() => { setEditingResource(null); setResourceForm({ category: emptyBilingual(), name: emptyBilingual(), location: '', isActive: true, order: 0 }); }}
                    className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] font-bold rounded-xl text-xs uppercase hover:border-[#B64847] transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {resources.length === 0 && <p className="text-gray-400 text-sm">No resources yet. Add one!</p>}
            {resources.map(r => (
              <div key={r.id} className={`bg-white rounded-2xl border p-4 ${r.isActive ? 'border-[#E4DBCA]' : 'border-[#E4DBCA] opacity-60'}`}>
                <div className="mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#886644]">{r.category.en}</p>
                  <p className="font-bold text-[#B64847]">{r.name.en}</p>
                  <p className="text-xs text-gray-500">📍 {r.location} · {r.isActive ? '✅ Active' : '❌ Inactive'}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEditResource(r)} className="px-3 py-1 bg-[#FFFAF5] border border-[#E4DBCA] text-[#B64847] font-bold rounded-lg text-xs hover:border-[#B64847] transition-all">Edit</button>
                  <button onClick={() => handleDeleteResource(r.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100 transition-all">Delete</button>
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
              {editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
            </h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <BilingualInput label="Title" value={announcementForm.title} onChange={v => setAnnouncementForm(f => ({ ...f, title: v }))} />
              <BilingualInput label="Description" value={announcementForm.description} onChange={v => setAnnouncementForm(f => ({ ...f, description: v }))} />
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" className={inputClass} value={announcementForm.date} onChange={e => setAnnouncementForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="announcementActive" checked={announcementForm.isActive} onChange={e => setAnnouncementForm(f => ({ ...f, isActive: e.target.checked }))} />
                <label htmlFor="announcementActive" className="text-sm font-bold text-[#886644]">Active</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#303030] transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : editingAnnouncement ? 'Update' : 'Add'}
                </button>
                {editingAnnouncement && (
                  <button type="button" onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ title: emptyBilingual(), description: emptyBilingual(), date: '', isActive: true, order: 0 }); }}
                    className="px-4 py-2 border-2 border-[#E4DBCA] text-[#886644] font-bold rounded-xl text-xs uppercase hover:border-[#B64847] transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {announcements.length === 0 && <p className="text-gray-400 text-sm">No announcements yet. Add one!</p>}
            {announcements.map(a => (
              <div key={a.id} className={`bg-white rounded-2xl border p-4 ${a.isActive ? 'border-[#E4DBCA]' : 'border-[#E4DBCA] opacity-60'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[#B64847]">{a.title.en}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{a.date}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{a.description.en}</p>
                <p className="text-[10px] text-gray-400">{a.isActive ? '✅ Active' : '❌ Inactive'}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEditAnnouncement(a)} className="px-3 py-1 bg-[#FFFAF5] border border-[#E4DBCA] text-[#B64847] font-bold rounded-lg text-xs hover:border-[#B64847] transition-all">Edit</button>
                  <button onClick={() => handleDeleteAnnouncement(a.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100 transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
