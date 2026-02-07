'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import FormField from '@/components/admin/forms/FormField';
import FormSection from '@/components/admin/forms/FormSection';
import FormActions from '@/components/admin/forms/FormActions';

interface CreateContentData {
  page: string;
  section: string;
  key: string;
  type: string;
  content: { id: string; en: string };
  order: number;
}

const pages = ['home', 'about', 'membership', 'visi-misi', 'contact'];
const sections = ['hero', 'intro', 'faq', 'cta', 'footer', 'about', 'team', 'values'];
const types = ['text', 'richtext', 'image', 'url'];

export default function CreateContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateContentData>({
    page: 'home',
    section: '',
    key: '',
    type: 'text',
    content: { id: '', en: '' },
    order: 999,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Content created successfully!');
        router.push('/admin/content');
      } else {
        alert('Failed to create content');
      }
    } catch (error) {
      alert('Error creating content');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate key from page and section
  const generateKey = () => {
    if (formData.page && formData.section) {
      return `${formData.page}_${formData.section}`.toLowerCase().replace(/\s+/g, '_');
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <FormSection
        title="Content Information"
        subtitle="Create new static page content"
      >
        <FormField label="Page" required>
          <select
            value={formData.page}
            onChange={(e) => setFormData({ ...formData, page: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          >
            {pages.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Section" required>
          <select
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          >
            <option value="">Select a section...</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Key">
          <input
            type="text"
            value={formData.key || generateKey()}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder={generateKey() || 'Auto-generated from page and section'}
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847] text-xs font-mono"
          />
          <p className="text-xs text-[#886644] mt-2">Unique identifier for this content (auto-generated)</p>
        </FormField>

        <FormField label="Content Type" required>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      {(formData.type === 'text' || formData.type === 'richtext') && (
        <FormSection title="Content">
          <BilingualInput
            label={formData.type === 'richtext' ? 'Rich Text Content' : 'Text Content'}
            type={formData.type === 'richtext' ? 'textarea' : 'text'}
            required
            valueId={formData.content.id}
            valueEn={formData.content.en}
            onChangeId={(v) => setFormData({ ...formData, content: { ...formData.content, id: v } })}
            onChangeEn={(v) => setFormData({ ...formData, content: { ...formData.content, en: v } })}
            placeholder={{ id: 'Konten Indonesia...', en: 'English content...' }}
            rows={formData.type === 'richtext' ? 4 : undefined}
          />
        </FormSection>
      )}

      {formData.type === 'image' && (
        <FormSection title="Image">
          <ImageUploader
            value={formData.content.en}
            onChange={(base64) => setFormData({ ...formData, content: { id: '', en: base64 } })}
            category="general"
            maxSizeMB={5}
          />
        </FormSection>
      )}

      {formData.type === 'url' && (
        <FormSection title="URL">
          <BilingualInput
            label="URL"
            type="text"
            required
            valueId={formData.content.id}
            valueEn={formData.content.en}
            onChangeId={(v) => setFormData({ ...formData, content: { ...formData.content, id: v } })}
            onChangeEn={(v) => setFormData({ ...formData, content: { ...formData.content, en: v } })}
            placeholder={{ id: 'https://...', en: 'https://...' }}
          />
        </FormSection>
      )}

      <FormSection title="Organization">
        <FormField label="Display Order">
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847]"
          />
        </FormField>
      </FormSection>

      <FormActions
        onCancel={() => router.back()}
        onSubmit={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        submitText="Create Content"
        isLoading={loading}
      />
    </form>
  );
}
