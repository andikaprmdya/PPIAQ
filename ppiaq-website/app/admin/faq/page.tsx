'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';

interface FAQItem {
  id: string;
  question: { id: string; en: string };
  page: string;
  order: number;
  isActive: boolean;
}

export default function FAQManagementPage() {
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'home' | 'membership'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  const pages = ['home', 'membership'];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/admin/faq');
      const data = await res.json();
      setFAQs(data.data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      alert('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = filter === 'all' ? faqs : faqs.filter((f) => f.page === filter);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFAQs(faqs.filter((f) => f.id !== id));
        alert('FAQ deleted successfully');
      }
    } catch (error) {
      alert('Failed to delete FAQ');
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const handleToggleActive = async (faq: FAQItem): Promise<void> => {
    try {
      const res = await fetch(`/api/admin/faq/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });

      if (res.ok) {
        setFAQs(faqs.map((f) => (f.id === faq.id ? { ...f, isActive: !f.isActive } : f)));
      }
    } catch (error) {
      alert('Failed to update FAQ');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">Manage FAQ</h1>
          <p className="text-[#886644] text-sm">Add and organize frequently asked questions</p>
        </div>

        <Link
          href="/admin/faq/create"
          className="px-8 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase"
        >
          + Create FAQ
        </Link>
      </div>

      {/* Page Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
            filter === 'all' ? 'bg-[#B64847] text-white' : 'bg-white border border-[#E4DBCA] text-[#886644]'
          }`}
        >
          All
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p as any)}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
              filter === p ? 'bg-[#B64847] text-white' : 'bg-white border border-[#E4DBCA] text-[#886644]'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* List View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">⏳ Loading FAQs...</p>
        </div>
      ) : filteredFAQs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold mb-4">No FAQs found</p>
          <Link
            href="/admin/faq/create"
            className="inline-block px-6 py-2 bg-[#B64847] text-white font-bold rounded-lg text-sm"
          >
            Create first FAQ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl border border-[#E4DBCA] p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#B64847] mb-2">{faq.question.en}</h3>
                  <p className="text-xs text-[#886644] mb-4">
                    <span className="font-bold uppercase">Page:</span> {faq.page}
                  </p>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded whitespace-nowrap ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {faq.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={() => handleToggleActive(faq)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg transition-all border-2 border-[#B64847] text-[#B64847] hover:bg-[#B64847] hover:text-white"
                >
                  {faq.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                </button>

                <Link
                  href={`/admin/faq/${faq.id}/edit`}
                  className="block w-full px-3 py-2 text-xs font-bold text-center rounded-lg bg-[#B64847] text-white hover:bg-[#303030] transition-all"
                >
                  ✏️ Edit
                </Link>

                <button
                  onClick={() => setDeleteConfirm({ show: true, id: faq.id })}
                  className="w-full px-3 py-2 text-xs font-bold text-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ?"
        confirmText="Delete"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
