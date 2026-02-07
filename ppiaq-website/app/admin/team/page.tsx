'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';

interface TeamMember {
  id: string;
  name: string;
  role: { id: string; en: string };
  division: string;
  isActive: boolean;
  order: number;
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'core' | 'admin' | 'education' | 'sports' | 'media' | 'partnership'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  const divisions = ['core', 'admin', 'education', 'sports', 'media', 'partnership'];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      setMembers(data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = filter === 'all' ? members : members.filter((m) => m.division === filter);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(members.filter((m) => m.id !== id));
        alert('Member deleted successfully');
      }
    } catch (error) {
      alert('Failed to delete member');
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });

      if (res.ok) {
        setMembers(members.map((m) => (m.id === member.id ? { ...m, isActive: !m.isActive } : m)));
      }
    } catch (error) {
      alert('Failed to update member');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">Manage Team</h1>
          <p className="text-[#886644] text-sm">Add, edit, and organize team members</p>
        </div>

        <Link
          href="/admin/team/create"
          className="px-8 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase"
        >
          + Add Member
        </Link>
      </div>

      {/* Division Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
            filter === 'all' ? 'bg-[#B64847] text-white' : 'bg-white border border-[#E4DBCA] text-[#886644]'
          }`}
        >
          All
        </button>
        {divisions.map((div) => (
          <button
            key={div}
            onClick={() => setFilter(div as any)}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
              filter === div ? 'bg-[#B64847] text-white' : 'bg-white border border-[#E4DBCA] text-[#886644]'
            }`}
          >
            {div.charAt(0).toUpperCase() + div.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">⏳ Loading team members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold mb-4">No team members found</p>
          <Link
            href="/admin/team/create"
            className="inline-block px-6 py-2 bg-[#B64847] text-white font-bold rounded-lg text-sm"
          >
            Add first member
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl border border-[#E4DBCA] p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#B64847]">{member.name}</h3>
                  <p className="text-xs text-[#886644] font-bold uppercase tracking-widest">{member.role.en}</p>
                </div>

                <span className={`text-xs font-bold px-2 py-1 rounded ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {member.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>

              <p className="text-xs text-[#886644] mb-4 uppercase">{member.division}</p>

              <div className="space-y-2">
                <button
                  onClick={() => handleToggleActive(member)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg transition-all border-2 border-[#B64847] text-[#B64847] hover:bg-[#B64847] hover:text-white"
                >
                  {member.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                </button>

                <Link
                  href={`/admin/team/${member.id}/edit`}
                  className="block w-full px-3 py-2 text-xs font-bold text-center rounded-lg bg-[#B64847] text-white hover:bg-[#303030] transition-all"
                >
                  ✏️ Edit
                </Link>

                <button
                  onClick={() => setDeleteConfirm({ show: true, id: member.id })}
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
        title="Delete Member"
        message="Are you sure you want to remove this team member?"
        confirmText="Delete"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
