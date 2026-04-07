'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusToggle from '@/components/admin/forms/StatusToggle';
import FormField from '@/components/admin/forms/FormField';
import FormSection from '@/components/admin/forms/FormSection';
import FormActions from '@/components/admin/forms/FormActions';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

export default function CuratorCreateEventPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    day: string;
    month: string;
    title: { id: string; en: string };
    date: string;
    location: { id: string; en: string };
    description: { id: string; en: string };
    image: string;
    registrationUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
  }>({
    day: '',
    month: '',
    title: { id: '', en: '' },
    date: '',
    location: { id: '', en: '' },
    description: { id: '', en: '' },
    image: '',
    registrationUrl: '',
    status: 'DRAFT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/curator/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(t('curator.events.eventCreatedSuccessfully', 'Event created successfully!'));
        router.push('/curator/events');
      } else {
        alert(t('curator.events.failedToCreateEvent', 'Failed to create event'));
      }
    } catch {
      alert(t('curator.events.errorCreatingEvent', 'Error creating event'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <FormSection
        title={t('admin.events.basicInformation', 'Basic Information')}
        subtitle={t('admin.events.basicInformationSubtitle', 'Enter the basic details about your event')}
      >
        <div className="grid grid-cols-2 gap-6">
          <FormField label={getTranslation(translations.common.day, language)} required>
            <input
              type="text"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              placeholder="e.g., 5"
              required
              className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
            />
          </FormField>

          <FormField label={getTranslation(translations.common.month, language)} required>
            <input
              type="text"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              placeholder="e.g., FEB"
              required
              className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
            />
          </FormField>
        </div>

        <BilingualInput
          label={getTranslation(translations.common.title, language)}
          required
          valueId={formData.title.id}
          valueEn={formData.title.en}
          onChangeId={(v) => setFormData({ ...formData, title: { ...formData.title, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, title: { ...formData.title, en: v } })}
          placeholder={{ id: 'Judul acara...', en: 'Event title...' }}
        />

        <FormField label={t('admin.events.fullDate', 'Full Date')} required>
          <input
            type="text"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="e.g., Thursday, February 5, 2026"
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <BilingualInput
          label={getTranslation(translations.common.location, language)}
          required
          valueId={formData.location.id}
          valueEn={formData.location.en}
          onChangeId={(v) => setFormData({ ...formData, location: { ...formData.location, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, location: { ...formData.location, en: v } })}
          placeholder={{ id: 'Lokasi acara...', en: 'Event location...' }}
        />
      </FormSection>

      <FormSection
        title={t('admin.events.details', 'Details')}
        subtitle={t('admin.events.detailsSubtitle', 'Provide more information about the event')}
      >
        <BilingualInput
          label={getTranslation(translations.common.description, language)}
          type="textarea"
          valueId={formData.description.id}
          valueEn={formData.description.en}
          onChangeId={(v) => setFormData({ ...formData, description: { ...formData.description, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, description: { ...formData.description, en: v } })}
          placeholder={{ id: 'Deskripsi acara...', en: 'Event description...' }}
          rows={4}
        />

        <FormField label={t('admin.events.registrationUrl', 'Registration URL')}>
          <input
            type="url"
            value={formData.registrationUrl}
            onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>
      </FormSection>

      <FormSection
        title={t('admin.events.media', 'Media')}
        subtitle={t('admin.events.mediaSubtitle', 'Upload an image for your event')}
      >
        <ImageUploader
          value={formData.image}
          onChange={(base64) => setFormData({ ...formData, image: base64 })}
          category="event"
          maxSizeMB={5}
        />
      </FormSection>

      <FormSection
        title={t('admin.events.publish', 'Publish')}
        subtitle={t('admin.events.publishSubtitle', 'Choose whether to publish or save as draft')}
      >
        <StatusToggle
          value={formData.status}
          onChange={(status) => setFormData({ ...formData, status })}
        />
      </FormSection>

      <FormActions
        onCancel={() => router.back()}
        onSubmit={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        submitText={t('admin.events.createEvent', 'Create Event')}
        isLoading={loading}
      />
    </form>
  );
}
