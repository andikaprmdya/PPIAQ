'use client';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <div className="mb-12">
      <div className="mb-8 pb-6 border-b-2 border-[#E4DBCA]">
        <h2 className="font-tan-angleton font-bold text-2xl text-[#B64847] mb-2">{title}</h2>
        {subtitle && <p className="text-[#886644] text-sm italic">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
