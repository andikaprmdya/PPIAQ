'use client';

interface EditButtonProps {
  onClick: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text';
  title?: string;
}

export default function EditButton({
  onClick,
  position = 'top-right',
  size = 'md',
  variant = 'icon',
  title = 'Edit content',
}: EditButtonProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        absolute ${positionClasses[position]} ${sizeClasses[size]}
        z-20
        flex items-center justify-center
        bg-[#FEB602] text-[#303030]
        rounded-full
        hover:bg-[#B64847] hover:text-white hover:scale-110
        active:scale-95
        shadow-lg
        transition-all duration-300
        font-bold
      `}
    >
      {variant === 'icon' ? '✏️' : 'Edit'}
    </button>
  );
}
