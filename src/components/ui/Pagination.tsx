import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}) => {
  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 p-1 ${className}`}>
      {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
        <span>
          Showing <span className="font-semibold text-white">{startItem}</span> to{' '}
          <span className="font-semibold text-white">{endItem}</span> of{' '}
          <span className="font-semibold text-white">{totalItems}</span> results
        </span>
      ) : (
        <span>
          Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
          <span className="font-semibold text-white">{totalPages}</span>
        </span>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="icon"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          tooltip="First page"
          iconOnly={<ChevronsLeft className="w-4 h-4" />}
        />
        <Button
          variant="icon"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          tooltip="Previous page"
          iconOnly={<ChevronLeft className="w-4 h-4" />}
        />

        <span className="px-2 font-medium text-zinc-300">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="icon"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          tooltip="Next page"
          iconOnly={<ChevronRight className="w-4 h-4" />}
        />
        <Button
          variant="icon"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          tooltip="Last page"
          iconOnly={<ChevronsRight className="w-4 h-4" />}
        />
      </div>
    </div>
  );
};

export default Pagination;
