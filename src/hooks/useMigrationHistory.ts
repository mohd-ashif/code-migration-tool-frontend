import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { JobRecord } from '../shared/types/api.types';

export interface HistoryFilters {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

async function fetchMigrationHistory(filters: HistoryFilters): Promise<{ jobs: JobRecord[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  params.set('limit', String(filters.limit ?? 20));
  params.set('offset', String(filters.offset ?? 0));

  const res: any = await apiClient.get(`/api/history?${params.toString()}`);
  return { jobs: res.jobs ?? [], total: res.total ?? (res.jobs ?? []).length };
}

export function useMigrationHistory(filters: HistoryFilters = {}) {
  const query = useQuery({
    queryKey: ['migrationHistory', filters],
    queryFn: () => fetchMigrationHistory(filters),
    staleTime: 30 * 1000,
  });

  return {
    jobs: query.data?.jobs ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
