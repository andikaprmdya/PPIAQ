'use client';

import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

interface Event {
  id: string;
  day: string;
  month: string;
  title: { id: string; en: string };
  date: string;
  location: { id: string; en: string };
  image: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
] as const;

export default function CuratorEventsPage() {
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
      const res = await fetch('/api/curator/events');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert(t('curator.events.failedToFetchEvents', 'Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' ? events : events.filter((event) => event.status === filter);
  const publishedCount = events.filter((event) => event.status === 'PUBLISHED').length;
  const draftCount = events.filter((event) => event.status === 'DRAFT').length;

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/curator/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter((event) => event.id !== id));
        alert(t('curator.events.eventDeletedSuccessfully', 'Event deleted successfully'));
      }
    } catch {
      alert(t('curator.events.failedToDeleteEvent', 'Failed to delete event'));
    }
    setDeleteConfirm({ show: false, id: null });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-[32px] border border-[#E4DBCA] bg-gradient-to-br from-white via-[#FFFAF5] to-[#E4DBCA]/40 p-5 shadow-[0_18px_40px_rgba(48,48,48,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#886644]">
              {t('curator.events.headlineTag', 'Upcoming events')}
            </p>
            <h1 className="mt-3 font-tan-angleton text-4xl font-bold text-[#B64847] sm:text-5xl">
              {t('curator.events.title', 'Curate events with the public-site look')}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#886644] sm:text-base">
              {t('curator.events.description', 'Review upcoming events, keep drafts tidy, and publish cards that stay readable on small screens.')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/curator/events/create"
              className="inline-flex items-center justify-center rounded-2xl bg-[#B64847] px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white shadow-[0_16px_30px_rgba(182,72,71,0.24)] transition-all hover:bg-[#303030]"
            >
              {t('curator.events.addEvent', 'Add Event')}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-[#E4DBCA] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#886644]">{t('curator.events.totalEvents', 'Total events')}</p>
            <p className="mt-3 font-tan-angleton text-4xl font-bold text-[#303030]">{events.length}</p>
          </div>
          <div className="rounded-[28px] border border-[#E4DBCA] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#886644]">{t('curator.events.published', 'Published')}</p>
            <p className="mt-3 font-tan-angleton text-4xl font-bold text-[#B64847]">{publishedCount}</p>
          </div>
          <div className="rounded-[28px] border border-[#E4DBCA] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#886644]">{t('curator.events.drafts', 'Drafts')}</p>
            <p className="mt-3 font-tan-angleton text-4xl font-bold text-[#886644]">{draftCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#E4DBCA] bg-white p-5 shadow-[0_18px_35px_rgba(48,48,48,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-tan-angleton text-2xl font-bold text-[#303030] sm:text-3xl">
              {t('curator.events.eventLibrary', 'Event library')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#886644]">
              {t('curator.events.eventLibraryDescription', 'Filter by publishing status, then manage each event from its card.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`
                  rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] transition-all sm:px-5
                  ${filter === option.value
                    ? 'bg-[#B64847] text-white shadow-[0_12px_24px_rgba(182,72,71,0.24)]'
                    : 'border border-[#E4DBCA] bg-[#FFFAF5] text-[#886644] hover:border-[#B64847] hover:text-[#B64847]'
                  }
                `}
              >
                {option.value === 'all'
                  ? t('curator.events.filters.all', 'All')
                  : option.value === 'DRAFT'
                    ? t('curator.events.filters.draft', 'Draft')
                    : t('curator.events.filters.published', 'Published')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[32px] border border-[#E4DBCA] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#886644]">
            {t('curator.events.loadingEvents', 'Loading events...')}
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-[32px] border border-[#E4DBCA] bg-white p-8 text-center shadow-sm">
          <p className="font-tan-angleton text-3xl font-bold text-[#B64847]">
            {t('curator.events.noEventsFound', 'No events found')}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#886644]">
            {t('curator.events.noEventsDescription', 'Start with a new event draft, or switch filters to review another set of listings.')}
          </p>
          <Link
            href="/curator/events/create"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#B64847] px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-[#303030]"
          >
            {t('curator.events.createFirstEvent', 'Create your first event')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="overflow-hidden rounded-[32px] border border-[#E4DBCA] bg-white shadow-[0_18px_35px_rgba(48,48,48,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_40px_rgba(48,48,48,0.08)]"
            >
              <div className="relative h-56 overflow-hidden border-b border-[#E4DBCA] bg-[#FEB602]/20 sm:h-64">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={language === 'id' ? event.title.id : event.title.en}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 40vw, 100vw"
                    unoptimized={event.image.startsWith('data:')}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FEB602] via-[#FFD35A] to-[#F5BE2E] px-6 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#7A572D]">
                      {t('curator.events.noEventImage', 'No event image uploaded')}
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 rounded-2xl bg-[#B64847] px-4 py-3 text-center text-white shadow-[0_12px_20px_rgba(182,72,71,0.25)]">
                  <p className="text-3xl font-bold leading-none">{event.day}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em]">{event.month}</p>
                </div>
                <div className="absolute right-5 top-5">
                  <span
                    className={`
                      inline-flex w-fit rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em]
                      ${event.status === 'PUBLISHED'
                        ? 'bg-white text-[#2B7A3D]'
                        : 'border border-[#E4DBCA] bg-[#FFF5D6] text-[#886644]'
                      }
                    `}
                  >
                    {event.status === 'PUBLISHED'
                      ? t('curator.events.published', 'Published')
                      : t('curator.events.filters.draft', 'Draft')}
                  </span>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#886644]">
                    {t('curator.events.upcomingEvent', 'Upcoming event')}
                  </p>
                  <h3 className="mt-2 font-tan-angleton text-2xl font-bold leading-tight text-[#303030] sm:text-3xl">
                    {language === 'id' ? event.title.id : event.title.en}
                  </h3>
                </div>

                <div className="grid gap-4 text-sm font-semibold text-[#303030] sm:grid-cols-2">
                  <div className="rounded-[24px] border border-[#E4DBCA] bg-[#FFFAF5] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#886644]">
                      {getTranslation(translations.common.date, language)}
                    </p>
                    <p className="mt-2 text-lg font-bold">{event.date}</p>
                  </div>
                  <div className="rounded-[24px] border border-[#E4DBCA] bg-[#FFFAF5] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#886644]">
                      {t('curator.events.venue', 'Venue')}
                    </p>
                    <p className="mt-2 text-lg font-bold">
                      {language === 'id' ? event.location.id : event.location.en}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#E4DBCA] bg-[#FFFAF5] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#886644]">
                    {t('curator.events.curatorActions', 'Curator actions')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#886644]">
                    {t('curator.events.curatorActionsDescription', 'Review the event details, then jump straight into editing or remove the entry if it is no longer needed.')}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/curator/events/${event.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#B64847] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-[#303030]"
                  >
                    {t('curator.events.editEvent', 'Edit Event')}
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm({ show: true, id: event.id })}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-red-700 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {t('curator.events.deleteEvent', 'Delete Event')}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={t('curator.events.deleteTitle', 'Delete Event')}
        message={t('curator.events.deleteMessage', 'Are you sure you want to delete this event? This action cannot be undone.')}
        confirmText={getTranslation(translations.common.delete, language)}
        cancelText={getTranslation(translations.common.cancel, language)}
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
