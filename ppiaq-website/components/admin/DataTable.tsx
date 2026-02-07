'use client';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
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
  emptyMessage = 'No data available',
}: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">⏳ Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
        <p className="text-[#886644] font-bold">{emptyMessage}</p>
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
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#E4DBCA]">
          {data.map((row, idx) => (
            <tr key={row[rowKey] || idx} className="hover:bg-[#FFFAF5] transition-all">
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
                      ✏️ Edit
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold"
                    >
                      🗑️ Delete
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
