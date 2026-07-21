import React, { ReactNode } from 'react';
import { ChevronUp, ChevronDown, Search as SearchIcon, RotateCcw, AlertCircle } from 'lucide-react';
import Button from './Button';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  onRetry?: () => void;
  stickyHeader?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Search
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export default function Table<T>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no items to show in this view.',
  emptyIcon = AlertCircle,
  onRetry,
  stickyHeader = true,
  sortBy,
  sortOrder,
  onSort,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <div className={`space-y-4 w-full animate-fadeIn ${className}`}>
      {/* Search Actions header bar */}
      {onSearchChange !== undefined && searchValue !== undefined && (
        <div className="relative max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <SearchIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-[#121324] border border-[#1E1F35] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:border-[#7C6CFF] outline-none transition-all placeholder:text-zinc-500 font-sans"
          />
        </div>
      )}

      {/* Main Table responsive scroll container */}
      <div className="overflow-x-auto w-full border border-zinc-800/40 rounded-2xl bg-[#0B0B14]/40 select-none">
        <table className="w-full text-left border-collapse">
          <thead className={stickyHeader ? 'sticky top-0 bg-[#0F101E] z-10' : 'bg-[#0F101E]'}>
            <tr className="border-b border-zinc-800/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-6 py-4 text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortBy === col.key && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Table loading skeletons
              [...Array(5)].map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-850/30">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-[#1E1F35]/50 animate-pulse rounded w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state inside table context
              <tr>
                <td colSpan={columns.length} className="py-12 px-6">
                  <div className="flex justify-center">
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-none bg-transparent"
                    >
                      {onRetry && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          onClick={onRetry}
                          className="mt-2"
                        >
                          Retry Connection
                        </Button>
                      )}
                    </EmptyState>
                  </div>
                </td>
              </tr>
            ) : (
              // Actual Table Data rows
              data.map((row: any, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="border-b border-zinc-850/30 hover:bg-[#121324]/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-xs font-sans text-zinc-300">
                      {col.render ? col.render(row) : (row[col.key] !== undefined ? String(row[col.key]) : '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component block */}
      {currentPage !== undefined && totalPages !== undefined && onPageChange !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800/20">
          <span className="text-[10px] font-mono text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
