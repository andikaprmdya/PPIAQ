'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import FormField from '@/components/admin/forms/FormField';
import FormSection from '@/components/admin/forms/FormSection';
import FormActions from '@/components/admin/forms/FormActions';
import { useLanguage } from '@/lib/language-context';
import { createTranslator } from '@/lib/translations';

interface TeamMemberData {
  id: string;
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

export default function EditTeamMemberPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const params = useParams();
  const memberId = params.id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<TeamMemberData | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/admin/team/${memberId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(data.data);
        }
      } catch (error) {
        alert(t('admin.team.failedToLoadMember', 'Failed to load member'));
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(t('admin.team.memberUpdatedSuccessfully', 'Member updated successfully!'));
        router.push('/admin/team');
      } else {
        alert(t('admin.team.failedToUpdateMember', 'Failed to update member'));
      }
    } catch (error) {
      alert(t('admin.team.errorUpdatingMember', 'Error updating member'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">{t('admin.team.loadingMember', 'Loading member...')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <FormSection title={t('admin.team.personalInformation', 'Personal Information')}>
        <FormField label={t('admin.team.fullName', 'Full Name')} required>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <BilingualInput
          label={t('admin.team.rolePosition', 'Role/Position')}
          required
          valueId={formData.role.id}
          valueEn={formData.role.en}
          onChangeId={(v) => setFormData({ ...formData, role: { ...formData.role, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, role: { ...formData.role, en: v } })}
        />

        <FormField label={t('admin.team.university', 'University')} required>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <FormField label={t('admin.team.instagram', 'Instagram')}>
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>
      </FormSection>

      <FormSection title={t('admin.team.biography', 'Biography')}>
        <BilingualInput
          label={t('admin.team.biography', 'Biography')}
          type="textarea"
          valueId={formData.bio.id}
          valueEn={formData.bio.en}
          onChangeId={(v) => setFormData({ ...formData, bio: { ...formData.bio, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, bio: { ...formData.bio, en: v } })}
          rows={3}
        />
      </FormSection>

      <FormSection title={t('admin.team.photo', 'Photo')}>
        <ImageUploader
          value={formData.image}
          onChange={(base64) => setFormData({ ...formData, image: base64 })}
          category="team"
        />
      </FormSection>

      <FormSection title={t('admin.team.organization', 'Organization')}>
        <FormField label={t('admin.team.division', 'Division')} required>
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

        <FormField label={t('admin.team.displayOrder', 'Display Order')}>
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
            <span className="font-bold text-sm text-[#B64847]">{t('admin.team.activeMember', 'Active Member')}</span>
          </label>
        </div>
      </FormSection>

      <FormActions
        onCancel={() => router.back()}
        onSubmit={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        submitText={t('admin.team.updateMember', 'Update Member')}
        isLoading={submitting}
      />
    </form>
  );
}
