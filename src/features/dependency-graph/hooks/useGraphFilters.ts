import { useState, useCallback } from 'react';
import { FilterState, DEFAULT_FILTERS } from '../types/graph';

export function useGraphFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const toggleFilter = useCallback((key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return { filters, toggleFilter, resetFilters };
}
