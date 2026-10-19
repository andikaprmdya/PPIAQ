export const inputClass = 'w-full rounded-xl border border-[#D8CCB7] bg-white px-4 py-3 text-[#303030] focus:outline-none focus:ring-2 focus:ring-[#B64847] disabled:bg-stone-100';
export const buttonClass = 'inline-flex items-center justify-center rounded-xl bg-[#B64847] px-5 py-3 text-sm font-bold text-white hover:bg-[#943b3a] disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryClass = 'inline-flex items-center justify-center rounded-xl border border-[#B64847] px-4 py-2 text-sm font-bold text-[#B64847] hover:bg-[#B64847]/5 disabled:opacity-50';
export const cardClass = 'rounded-2xl border border-[#E4DBCA] bg-white p-5 md:p-7';

export function ElectionBadge({ status }: { status: string }) {
  const color = status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-900' :
    status === 'DRAFT' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700';
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${color}`}>{status}</span>;
}
