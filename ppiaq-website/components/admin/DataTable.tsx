'use client';

import type { ReactNode } from 'react';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

type TableRow = Record<string, ReactNode>;

interface DataTableProps {
  columns: Column[];
  data: TableRow[];
  onEdit?: (item: TableRow) => void;
  onDelete?: (item: TableRow) => void;
  rowKey?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  rowKey = 'id',
  loading = false,
  emptyMessage,
}: DataTableProps) {
  const { language } = useLanguage();
  const emptyLabel = emptyMessage || getTranslation(translations.dataTable.empty, language);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">⏳ {getTranslation(translations.dataTable.loading, language)}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E4DBCA] shadow-sm">
      <table className="w-full">
        <thead className="bg-[#FFFAF5] border-b border-[#E4DBCA]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]"
              >
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#886644]">
                {getTranslation(translations.dataTable.actions, language)}
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#E4DBCA]">
          {data.map((row, idx) => (
            <tr
              key={
                typeof row[rowKey] === 'string' || typeof row[rowKey] === 'number'
                  ? row[rowKey] as string | number
                  : idx
              }
              className="hover:bg-[#FFFAF5] transition-all"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-[#303030]">
                  {row[col.key]}
                </td>
              ))}

              {(onEdit || onDelete) && (
                <td className="px-6 py-4 text-sm space-x-2 flex">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="px-3 py-1 bg-[#B64847] text-white rounded-lg hover:bg-[#303030] transition-all text-xs font-bold"
                    >
                      ✏️ {getTranslation(translations.dataTable.edit, language)}
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold"
                    >
                      🗑️ {getTranslation(translations.dataTable.delete, language)}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
