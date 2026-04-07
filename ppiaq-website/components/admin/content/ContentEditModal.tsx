'use client';

import { useState } from 'react';
import BilingualInput from '@/components/admin/BilingualInput';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

interface ContentSection {
  id: string;
  key: string;
  section: string;
  content: { id: string; en: string };
  image?: string;
  type: string;
  page: string;
}

interface ContentEditModalProps {
  section: ContentSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Record<string, unknown>) => void;
}

export default function ContentEditModal({ section, isOpen, onClose, onSave }: ContentEditModalProps) {
  const { language } = useLanguage();
  const [contentId, setContentId] = useState(section.content?.id || '');
  const [contentEn, setContentEn] = useState(section.content?.en || '');
  const [image, setImage] = useState(section.image || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        content: {
          id: contentId,
          en: contentEn,
        },
      };

      if (image) {
        updateData.image = image;
      }

      await onSave(updateData);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal Background Click to Close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mb-2">
              {getTranslation(translations.admin.content.modal.editContent, language)}
            </p>
            <h2 className="font-tan-angleton font-bold text-2xl text-[#B64847]">{section.key}</h2>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#886644] hover:text-[#B64847] text-2xl font-bold transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Bilingual Text Input */}
          <BilingualInput
            label={getTranslation(translations.admin.content.modal.contentText, language)}
            valueId={contentId}
            valueEn={contentEn}
            onChangeId={setContentId}
            onChangeEn={setContentEn}
            type="textarea"
            rows={5}
            placeholder={{
              id: 'Masukkan konten dalam Bahasa Indonesia...',
              en: 'Enter content in English...',
            }}
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
              {getTranslation(translations.admin.content.modal.imageOptional, language)}
            </label>

            {/* Image Preview */}
            {image && (
              <div className="mb-4 rounded-xl overflow-hidden border-2 border-[#E4DBCA]">
                <img src={image} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all ${
                  image ? 'border-green-300 bg-green-50' : 'border-[#E4DBCA] hover:border-[#B64847]'
                }
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setImage(event.target?.result as string);
                  };
                  reader.readAsDataURL(files[0]);
                }
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setImage(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={isLoading}
                className="hidden"
                id="image-upload"
              />

              <label htmlFor="image-upload" className="cursor-pointer">
                <p className="font-bold text-[#B64847] mb-1">
                  {image
                    ? getTranslation(translations.admin.content.modal.imageUploaded, language)
                    : getTranslation(translations.admin.content.modal.dragImage, language)}
                </p>
                <p className="text-xs text-[#886644]">
                  {getTranslation(translations.admin.content.modal.imageFormatHint, language)}
                </p>
              </label>
            </div>

            {/* Clear Image Button */}
            {image && (
              <button
                type="button"
                onClick={() => setImage('')}
                disabled={isLoading}
                className="mt-2 text-sm text-red-600 font-bold hover:underline disabled:opacity-50"
              >
                {getTranslation(translations.admin.content.modal.removeImage, language)}
              </button>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-[#E4DBCA]">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-sm uppercase disabled:opacity-50"
            >
              {getTranslation(translations.common.cancel, language)}
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading || (!contentId && !contentEn)}
              className="flex-1 px-4 py-3 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? getTranslation(translations.admin.content.modal.saving, language)
                : getTranslation(translations.admin.content.modal.saveChanges, language)}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
