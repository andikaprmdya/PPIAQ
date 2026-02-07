'use client';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}

export default function FormField({ label, error, required, help, children }: FormFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold uppercase tracking-widest text-[#886644] mb-2">
        {label}
        {required && <span className="text-[#B64847]"> *</span>}
      </label>

      {children}

      {help && <p className="text-xs text-[#886644] mt-1 italic">{help}</p>}

      {error && <p className="text-red-600 text-sm font-bold mt-1">❌ {error}</p>}
    </div>
  );
}
