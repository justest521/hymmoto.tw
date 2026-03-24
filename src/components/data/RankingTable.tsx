'use client';

import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  width: string;
}

interface RankingTableProps<T> {
  data: T[];
  columns: Column[];
  renderCell?: (item: T, key: string) => React.ReactNode;
  onSort?: (key: string) => void;
}

export default function RankingTable<T extends Record<string, any>>({
  data,
  columns,
  renderCell,
  onSort,
}: RankingTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/50">
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                onClick={() => handleSort(column.key)}
                className="px-4 py-4 text-left font-semibold text-[#b8f53e] cursor-pointer hover:bg-gray-700/50 transition-colors text-center select-none"
              >
                <div className="flex items-center justify-center gap-2">
                  {column.label}
                  {sortConfig?.key === column.key && (
                    <ArrowUpDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-800 transition-colors ${
                idx % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-900/50'
              } hover:bg-gray-800/50`}
            >
              {columns.map((column) => (
                <td
                  key={`${idx}-${column.key}`}
                  style={{ width: column.width }}
                  className="px-4 py-4 text-gray-300 text-center"
                >
                  <div className="flex items-center justify-center">
                    {renderCell ? renderCell(item, column.key) : item[column.key]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-center">沒有數據可顯示</p>
        </div>
      )}
    </div>
  );
}
