'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

interface Event {
  id: string;
  day: string;
  month: string;
  title: { id: string; en: string };
  date: string;
  location: { id: string; en: string };
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
}

export default function EventsManagementPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert(t('admin.events.failedToFetchEvents', 'Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.status === filter);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id));
        alert(t('admin.events.eventDeletedSuccessfully', 'Event deleted successfully'));
      }
    } catch (error) {
      alert(t('admin.events.failedToDeleteEvent', 'Failed to delete event'));
    }
    setDeleteConfirm({ show: false, id: null });
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">
            {t('admin.events.title', 'Manage Events')}
          </h1>
          <p className="text-[#886644] text-sm">{t('admin.events.description', 'Create, edit, and publish events for your community')}</p>
        </div>

        <Link
          href="/admin/events/create"
          className="px-8 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase"
        >
          + {t('admin.events.createEvent', 'Create Event')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {(['all', 'DRAFT', 'PUBLISHED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`
              px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all
              ${filter === status
                ? 'bg-[#B64847] text-white'
                : 'bg-white border border-[#E4DBCA] text-[#886644] hover:border-[#B64847]'
              }
            `}
          >
            {status === 'all'
              ? t('admin.events.filters.all', 'All')
              : status === 'DRAFT'
                ? `📝 ${t('admin.events.filters.draft', 'Draft')}`
                : `✅ ${t('admin.events.filters.published', 'Published')}`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">⏳ {t('curator.events.loadingEvents', 'Loading events...')}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold mb-4">{t('admin.events.noEventsFound', 'No events found')}</p>
          <Link
            href="/admin/events/create"
            className="inline-block px-6 py-2 bg-[#B64847] text-white font-bold rounded-lg text-sm"
          >
            {t('admin.events.createFirstEvent', 'Create your first event')}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E4DBCA] shadow-sm bg-white">
          <table className="w-full">
            <thead className="bg-[#FFFAF5] border-b border-[#E4DBCA]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  {getTranslation(translations.common.date, language)}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  {getTranslation(translations.common.title, language)}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  {getTranslation(translations.common.location, language)}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  {getTranslation(translations.common.status, language)}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  {getTranslation(translations.common.actions, language)}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4DBCA]">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-[#FFFAF5] transition-all">
                  <td className="px-6 py-4 text-sm text-[#303030] font-bold whitespace-nowrap">
                    {event.day} {event.month}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#303030]">
                    {language === 'id' ? event.title.id : event.title.en}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#303030]">
                    {language === 'id' ? event.location.id : event.location.en}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`
                        inline-block px-3 py-1 rounded-full text-xs font-bold
                        ${event.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }
                      `}
                    >
                      {event.status === 'PUBLISHED'
                        ? `✅ ${t('admin.events.filters.published', 'Published')}`
                        : `📝 ${t('admin.events.filters.draft', 'Draft')}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="px-3 py-1 bg-[#B64847] text-white rounded-lg hover:bg-[#303030] transition-all text-xs font-bold"
                    >
                      ✏️ {getTranslation(translations.common.edit, language)}
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, id: event.id })}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold"
                    >
                      🗑️ {getTranslation(translations.common.delete, language)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={t('admin.events.deleteTitle', 'Delete Event')}
        message={t('admin.events.deleteMessage', 'Are you sure you want to delete this event? This action cannot be undone.')}
        confirmText={getTranslation(translations.common.delete, language)}
        cancelText={getTranslation(translations.common.cancel, language)}
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
