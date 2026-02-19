'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import FormField from '@/components/admin/forms/FormField';
import FormSection from '@/components/admin/forms/FormSection';
import FormActions from '@/components/admin/forms/FormActions';

interface CreateTeamMemberData {
  name: string;
  role: { id: string; en: string };
  university: string;
  instagram: string;
  image: string;
  bio: { id: string; en: string };
  division: string;
  order: number;
  isActive: boolean;
}

const divisions = ['CORE', 'ADMIN', 'EDUCATION', 'SPORTS', 'MEDIA', 'PARTNERSHIP'];

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    name: '',
    role: { id: '', en: '' },
    university: '',
    instagram: '',
    image: '',
    bio: { id: '', en: '' },
    division: 'CORE',
    order: 999,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Team member added successfully!');
        router.push('/admin/team');
      } else {
        alert('Failed to add team member');
      }
    } catch (error) {
      alert('Error adding team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <FormSection
        title="Personal Information"
        subtitle="Enter the team member details"
      >
        <FormField label="Full Name" required>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Rafika Kusuma"
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <BilingualInput
          label="Role/Position"
          required
          valueId={formData.role.id}
          valueEn={formData.role.en}
          onChangeId={(v) => setFormData({ ...formData, role: { ...formData.role, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, role: { ...formData.role, en: v } })}
          placeholder={{ id: 'Jabatan...', en: 'Position...' }}
        />

        <FormField label="University" required>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            placeholder="e.g., University of Queensland"
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <FormField label="Instagram Handle">
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="@handle"
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Biography"
        subtitle="Add a short biography"
      >
        <BilingualInput
          label="Bio"
          type="textarea"
          valueId={formData.bio.id}
          valueEn={formData.bio.en}
          onChangeId={(v) => setFormData({ ...formData, bio: { ...formData.bio, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, bio: { ...formData.bio, en: v } })}
          placeholder={{ id: 'Biografi...', en: 'Biography...' }}
          rows={3}
        />
      </FormSection>

      <FormSection title="Photo">
        <ImageUploader
          value={formData.image}
          onChange={(base64) => setFormData({ ...formData, image: base64 })}
          category="team"
          maxSizeMB={5}
        />
      </FormSection>

      <FormSection title="Organization">
        <FormField label="Division" required>
          <select
            value={formData.division}
            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          >
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div.charAt(0) + div.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Display Order">
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 accent-[#B64847]"
            />
            <span className="font-bold text-sm text-[#B64847]">Active Member</span>
          </label>
        </div>
      </FormSection>

      <FormActions
        onCancel={() => router.back()}
        onSubmit={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        submitText="Add Member"
        isLoading={loading}
      />
    </form>
  );
}
