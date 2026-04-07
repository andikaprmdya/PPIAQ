'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

interface ImageUploaderProps {
  value: string;
  onChange: (base64: string) => void;
  category?: 'event' | 'team' | 'hero' | 'general';
  maxSizeMB?: number;
  showLibrary?: boolean;
  onLibraryClick?: () => void;
}

export default function ImageUploader({
  value,
  onChange,
  maxSizeMB = 5,
  showLibrary = false,
  onLibraryClick,
}: ImageUploaderProps) {
  const { language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`${getTranslation(translations.imageUploader.fileSizeError, language)} ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(getTranslation(translations.imageUploader.fileTypeError, language));
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(getTranslation(translations.imageUploader.processError, language));
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-3">
        {getTranslation(translations.imageUploader.imageLabel, language)}
      </label>

      {/* Preview */}
      {value && (
        <div className="mb-4 rounded-xl overflow-hidden border-2 border-[#E4DBCA]">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative
          border-2 border-dashed rounded-xl p-8
          text-center cursor-pointer
          transition-all
          ${isDragging ? 'border-[#B64847] bg-[#B64847]/10' : 'border-[#E4DBCA] hover:border-[#B64847]'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          disabled={isLoading}
          className="hidden"
          id="image-upload"
        />

        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="text-3xl mb-2">📸</div>
          <p className="font-bold text-[#B64847] mb-1">
            {isLoading
              ? getTranslation(translations.imageUploader.uploading, language)
              : getTranslation(translations.imageUploader.dragOrClick, language)}
          </p>
          <p className="text-xs text-[#886644]">
            {getTranslation(translations.imageUploader.formatHint, language)} {maxSizeMB}MB
          </p>
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm font-bold mt-2">❌ {error}</p>
      )}

      {/* Library Button */}
      {showLibrary && onLibraryClick && (
        <button
          type="button"
          onClick={onLibraryClick}
          className="mt-3 w-full px-4 py-2 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-sm"
        >
          📚 {getTranslation(translations.imageUploader.selectFromLibrary, language)}
        </button>
      )}
    </div>
  );
}
