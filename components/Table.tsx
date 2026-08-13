import React from 'react';

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number, onRowClick?: (item: T) => void) => React.ReactNode;
  onRowClick?: (item: T) => void;
  tableClassName?: string;
}

export function Table<T>({ headers, data, renderRow, onRowClick, tableClassName = '' }: TableProps<T>) {
  return (
    <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm overflow-hidden border border-slate-200/80 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-sm text-slate-800 dark:text-gray-200 ${tableClassName}`}>
            <thead className="bg-slate-50 dark:bg-gray-900/60 text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-gray-800">
                <tr>{headers.map(h => <th key={h} className="p-3.5 px-4 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/70">
                {data.length > 0 ? (
                    data.map((item, index) => renderRow(item, index, onRowClick))
                ) : (
                    <tr>
                        <td colSpan={headers.length} className="p-8 text-center text-slate-400 dark:text-gray-500 italic">
                            No data available
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
