'use client';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDanger?: boolean;
}

export default function FormActions({
  onCancel,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  isDanger = false,
}: FormActionsProps) {
  return (
    <div className="flex gap-4 mt-12 pt-8 border-t border-[#E4DBCA]">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-8 py-3 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-sm uppercase disabled:opacity-50"
      >
        {cancelText}
      </button>

      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className={`
            px-8 py-3 font-bold rounded-xl transition-all text-sm uppercase
            ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#B64847] hover:bg-[#303030]'}
            text-white disabled:opacity-50
          `}
        >
          {isLoading ? '⏳ Processing...' : submitText}
        </button>
      )}
    </div>
  );
}
