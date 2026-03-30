'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';

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

export default function CuratorEventsPage() {
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
      alert('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.status === filter);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/curator/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id));
        alert('Event deleted successfully');
      }
    } catch {
      alert('Failed to delete event');
    }
    setDeleteConfirm({ show: false, id: null });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">Manage Upcoming Events</h1>
          <p className="text-[#886644] text-sm">View, add, edit, publish, and delete upcoming events</p>
        </div>

        <Link
          href="/curator/events/create"
          className="px-8 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase"
        >
          + Add Event
        </Link>
      </div>

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
            {status === 'all' ? 'All' : status === 'DRAFT' ? '📝 Draft' : '✅ Published'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">⏳ Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold mb-4">No events found</p>
          <Link
            href="/curator/events/create"
            className="inline-block px-6 py-2 bg-[#B64847] text-white font-bold rounded-lg text-sm"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E4DBCA] shadow-sm bg-white">
          <table className="w-full">
            <thead className="bg-[#FFFAF5] border-b border-[#E4DBCA]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4DBCA]">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-[#FFFAF5] transition-all">
                  <td className="px-6 py-4 text-sm text-[#303030] font-bold whitespace-nowrap">
                    {event.day} {event.month}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#303030]">{event.title.en}</td>
                  <td className="px-6 py-4 text-sm text-[#303030]">{event.location.en}</td>
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
                      {event.status === 'PUBLISHED' ? '✅ Published' : '📝 Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <Link
                      href={`/curator/events/${event.id}/edit`}
                      className="px-3 py-1 bg-[#B64847] text-white rounded-lg hover:bg-[#303030] transition-all text-xs font-bold"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, id: event.id })}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold"
                    >
                      🗑️ Delete
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
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
