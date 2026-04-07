'use client';

import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

interface StatusToggleProps {
  value: 'DRAFT' | 'PUBLISHED';
  onChange: (status: 'DRAFT' | 'PUBLISHED') => void;
}

export default function StatusToggle({ value, onChange }: StatusToggleProps) {
  const { language } = useLanguage();

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
        {getTranslation(translations.statusToggle.status, language)}
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange('DRAFT')}
          className={`
            flex-1 px-4 py-3 rounded-xl font-bold uppercase text-sm transition-all
            ${value === 'DRAFT'
              ? 'bg-[#E4DBCA] text-[#303030]'
              : 'border-2 border-[#E4DBCA] text-[#886644] hover:border-[#B64847]'
            }
          `}
        >
          📝 {getTranslation(translations.statusToggle.draft, language)}
        </button>

        <button
          type="button"
          onClick={() => onChange('PUBLISHED')}
          className={`
            flex-1 px-4 py-3 rounded-xl font-bold uppercase text-sm transition-all
            ${value === 'PUBLISHED'
              ? 'bg-[#B64847] text-white'
              : 'border-2 border-[#E4DBCA] text-[#886644] hover:border-[#B64847]'
            }
          `}
        >
          ✅ {getTranslation(translations.statusToggle.published, language)}
        </button>
      </div>
    </div>
  );
}
