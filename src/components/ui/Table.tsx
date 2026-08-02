import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Input from './Input';
import Checkbox from './Checkbox';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import Pagination from './Pagination';

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  bulkActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search table...',
  pageSize = 10,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  bulkActions,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filters.',
  onRowClick,
  stickyHeader = true,
  className = '',
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const query = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      )
    );
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allKeys = paginatedData.map(keyExtractor);
      onSelectionChange(Array.from(new Set([...selectedKeys, ...allKeys])));
    } else {
      const pageKeys = new Set(paginatedData.map(keyExtractor));
      onSelectionChange(selectedKeys.filter((k) => !pageKeys.has(k)));
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedKeys, key]);
    } else {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    }
  };

  const isAllPageSelected =
    paginatedData.length > 0 && paginatedData.every((row) => selectedKeys.includes(keyExtractor(row)));

  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      {/* Table Toolbar (Search & Bulk Actions) */}
      {(searchable || (selectable && selectedKeys.length > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-1">
          {searchable && (
            <div className="w-full sm:w-72">
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {selectable && selectedKeys.length > 0 && (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-primary-light">
              <span>{selectedKeys.length} selected</span>
              {bulkActions}
            </div>
          )}
        </div>
      )}

      {/* Main Responsive Table Container */}
      <div className="w-full overflow-x-auto border border-border rounded-xl bg-darkCard shadow-card">
        <table className="w-full text-left border-collapse text-sm">
          <thead className={stickyHeader ? 'sticky top-0 z-10 bg-darkSidebar border-b border-border' : 'bg-darkSidebar border-b border-border'}>
            <tr>
              {selectable && (
                <th className="p-3.5 w-12 text-center border-b border-border">
                  <Checkbox
                    checked={isAllPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={[
                    'p-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider select-none border-b border-border',
                    col.sortable ? 'cursor-pointer hover:text-white' : '',
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="shrink-0 text-zinc-500">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 text-zinc-300">
            {loading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <tr key={i}>
                  {selectable && (
                    <td className="p-4 text-center">
                      <Skeleton width={16} height={16} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="p-4">
                      <Skeleton height={18} width="80%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} compact />
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const key = keyExtractor(row);
                const isSelected = selectedKeys.includes(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={[
                      'transition-colors hover:bg-zinc-800/40',
                      isSelected ? 'bg-primary/10' : '',
                      onRowClick ? 'cursor-pointer' : '',
                    ].join(' ')}
                  >
                    {selectable && (
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(key, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          'p-3.5 text-sm',
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                        ].join(' ')}
                      >
                        {col.accessor ? col.accessor(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && sortedData.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedData.length}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

export default Table;
