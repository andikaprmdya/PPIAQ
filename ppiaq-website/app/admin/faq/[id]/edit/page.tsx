'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BilingualInput from '@/components/admin/BilingualInput';
import FormField from '@/components/admin/forms/FormField';
import FormSection from '@/components/admin/forms/FormSection';
import FormActions from '@/components/admin/forms/FormActions';

interface FAQData {
  id: string;
  page: string;
  question: { id: string; en: string };
  answer: { id: string; en: string };
  order: number;
  isActive: boolean;
}

const pages = ['home', 'membership'];

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const faqId = params.id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FAQData | null>(null);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await fetch(`/api/admin/faq/${faqId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(data.data);
        }
      } catch (error) {
        alert('Failed to load FAQ');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, [faqId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/faq/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('FAQ updated successfully!');
        router.push('/admin/faq');
      } else {
        alert('Failed to update FAQ');
      }
    } catch (error) {
      alert('Error updating FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">Loading FAQ...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <FormSection
        title="FAQ Information"
        subtitle="Edit the frequently asked question"
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
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection
        title="Question & Answer"
        subtitle="Edit the question and answer in both languages"
      >
        <BilingualInput
          label="Question"
          required
          valueId={formData.question.id}
          valueEn={formData.question.en}
          onChangeId={(v) => setFormData({ ...formData, question: { ...formData.question, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, question: { ...formData.question, en: v } })}
        />

        <BilingualInput
          label="Answer"
          type="textarea"
          required
          valueId={formData.answer.id}
          valueEn={formData.answer.en}
          onChangeId={(v) => setFormData({ ...formData, answer: { ...formData.answer, id: v } })}
          onChangeEn={(v) => setFormData({ ...formData, answer: { ...formData.answer, en: v } })}
          rows={4}
        />
      </FormSection>

      <FormSection title="Organization">
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
            <span className="font-bold text-sm text-[#B64847]">Active FAQ</span>
          </label>
        </div>
      </FormSection>

      <FormActions
        onCancel={() => router.back()}
        onSubmit={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
        submitText="Update FAQ"
        isLoading={submitting}
      />
    </form>
  );
}
