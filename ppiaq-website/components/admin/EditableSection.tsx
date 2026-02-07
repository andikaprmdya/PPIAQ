'use client';

import { useAuth } from '@/lib/auth-context';
import EditButton from './EditButton';
import { useState } from 'react';

interface EditableSectionProps {
  contentType: 'event' | 'team' | 'static' | 'faq';
  contentId: string;
  editUrl?: string;
  onEdit?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function EditableSection({
  contentType,
  contentId,
  editUrl,
  onEdit,
  children,
  className = '',
}: EditableSectionProps) {
  const { isAdmin } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  if (!isAdmin) {
    return <div className={className}>{children}</div>;
  }

  const handleEdit = () => {
    if (editUrl) {
      window.location.href = editUrl;
    } else if (onEdit) {
      onEdit();
    }
  };

  return (
    <div
      className={`relative group ${isHovered ? 'ring-2 ring-[#FEB602] rounded-lg' : ''} transition-all ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content */}
      {children}

      {/* Edit Button - Only visible to admins on hover */}
      {isHovered && (
        <EditButton
          onClick={handleEdit}
          position="top-right"
          size="md"
          variant="icon"
        />
      )}

      {/* Overlay hint on hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center rounded-lg opacity-10 bg-[#FEB602]" />
      )}
    </div>
  );
}
