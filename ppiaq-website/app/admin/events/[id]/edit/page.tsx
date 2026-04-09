'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusToggle from '@/components/admin/forms/StatusToggle';
import FormField from '@/components/admin/forms/FormField';
import FormSection from '@/components/admin/forms/FormSection';
import FormActions from '@/components/admin/forms/FormActions';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';

interface EventData {
  id: string;
  day: string;
  month: string;
  title: { id: string; en: string };
  date: string;
  organizer?: string;
  location: { id: string; en: string };
  description: { id: string; en: string };
  image: string;
  registrationUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function EditEventPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const params = useParams();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(data.data);
        }
      } catch (error) {
        alert(t('admin.events.failedToLoadEvent', 'Failed to load event'));
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(t('admin.events.eventUpdatedSuccessfully', 'Event updated successfully!'));
        router.push('/admin/events');
      } else {
        alert(t('admin.events.failedToUpdateEvent', 'Failed to update event'));
      }
    } catch (error) {
      alert(t('admin.events.errorUpdatingEvent', 'Error updating event'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">⏳ {t('admin.events.loadingEvent', 'Loading event...')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <FormSection
        title={t('admin.events.basicInformation', 'Basic Information')}
        subtitle={t('admin.events.editBasicInformationSubtitle', 'Edit the basic details about your event')}
      >
        <div className="grid grid-cols-2 gap-6">
          <FormField label={getTranslation(translations.common.day, language)} required>
            <input
              type="text"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              required
              className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
            />
          </FormField>

          <FormField label={getTranslation(translations.common.month, language)} required>
            <input
              type="text"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
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
        />

        <FormField label={t('admin.events.fullDate', 'Full Date')} required>
          <input
            type="text"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>

        <FormField label={getTranslation(translations.common.organizer, language)} required>
          <input
            type="text"
            value={formData.organizer || ''}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            placeholder={language === 'id' ? 'mis. PPIAQ, UQISA, QUT' : 'e.g., PPIAQ, UQISA, QUT'}
            list="event-organizer-suggestions"
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
          <datalist id="event-organizer-suggestions">
            <option value="PPIAQ" />
            <option value="UQISA" />
            <option value="QUT" />
            <option value="Griffith" />
            <option value="JCU" />
            <option value="Other" />
          </datalist>
        </FormField>

        <BilingualInput
          label={getTranslation(translations.common.location, language)}
          required
          valueId={formData.location.id}
          valueEn={formData.location.en}
          onChangeId={(v) => setFormData({ ...formData, location: { ...formData.location, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, location: { ...formData.location, en: v } })}
        />
      </FormSection>

      <FormSection title={t('admin.events.details', 'Details')}>
        <BilingualInput
          label={getTranslation(translations.common.description, language)}
          type="textarea"
          valueId={formData.description.id}
          valueEn={formData.description.en}
          onChangeId={(v) => setFormData({ ...formData, description: { ...formData.description, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, description: { ...formData.description, en: v } })}
          rows={4}
        />

        <FormField label={t('admin.events.registrationUrl', 'Registration URL')}>
          <input
            type="url"
            value={formData.registrationUrl || ''}
            onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>
      </FormSection>

      <FormSection title={t('admin.events.media', 'Media')}>
        <ImageUploader
          value={formData.image}
          onChange={(base64) => setFormData({ ...formData, image: base64 })}
          category="event"
        />
      </FormSection>

      <FormSection title={t('admin.events.publish', 'Publish')}>
        <StatusToggle
          value={formData.status}
          onChange={(status) => setFormData({ ...formData, status })}
        />
      </FormSection>

      <FormActions
        onCancel={() => router.back()}
        onSubmit={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        submitText={t('admin.events.updateEvent', 'Update Event')}
        isLoading={submitting}
      />
    </form>
  );
}
