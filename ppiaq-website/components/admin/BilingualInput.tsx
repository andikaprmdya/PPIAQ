'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

interface BilingualInputProps {
  label: string;
  valueId: string;
  valueEn: string;
  onChangeId: (value: string) => void;
  onChangeEn: (value: string) => void;
  type?: 'text' | 'textarea' | 'richtext';
  required?: boolean;
  placeholder?: { id: string; en: string };
  rows?: number;
}

export default function BilingualInput({
  label,
  valueId,
  valueEn,
  onChangeId,
  onChangeEn,
  type = 'text',
  required = false,
  placeholder,
  rows = 4,
}: BilingualInputProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
        {label}
        {required && <span className="text-[#B64847]"> *</span>}
      </label>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 border-b border-[#E4DBCA]">
        <button
          type="button"
          onClick={() => setActiveTab('id')}
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-all ${
            activeTab === 'id'
              ? 'text-[#B64847] border-b-2 border-[#B64847] -mb-px'
              : 'text-[#886644] hover:text-[#B64847]'
          }`}
        >
          {getTranslation(translations.bilingualInput.indonesian, language)}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-all ${
            activeTab === 'en'
              ? 'text-[#B64847] border-b-2 border-[#B64847] -mb-px'
              : 'text-[#886644] hover:text-[#B64847]'
          }`}
        >
          {getTranslation(translations.bilingualInput.english, language)}
        </button>
      </div>

      {/* Input Field */}
      {type === 'text' && (
        <input
          type="text"
          value={activeTab === 'id' ? valueId : valueEn}
          onChange={(e) => (activeTab === 'id' ? onChangeId(e.target.value) : onChangeEn(e.target.value))}
          placeholder={activeTab === 'id' ? placeholder?.id : placeholder?.en}
          required={required}
          className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847] transition-all"
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={activeTab === 'id' ? valueId : valueEn}
          onChange={(e) => (activeTab === 'id' ? onChangeId(e.target.value) : onChangeEn(e.target.value))}
          placeholder={activeTab === 'id' ? placeholder?.id : placeholder?.en}
          required={required}
          rows={rows}
          className="w-full px-4 py-3 border border-[#E4DBCA] rounded-xl focus:outline-none focus:border-[#B64847] transition-all resize-none"
        />
      )}

      {/* Character count */}
      <p className="text-xs text-[#886644] mt-2 text-right">
        {activeTab === 'id' ? valueId.length : valueEn.length} {getTranslation(translations.bilingualInput.characters, language)}
      </p>
    </div>
  );
}
