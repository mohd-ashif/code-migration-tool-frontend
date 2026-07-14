import { useQuery } from '@tanstack/react-query';
import { getDependencyGraph } from '../api';

export function useDependencyGraph(
  jobId: string | null,
  page: number,
  limit: number,
  search?: string,
  filter?: string
) {
  const query = useQuery({
    queryKey: ['graph', jobId, page, limit, search, filter],
    queryFn: () => getDependencyGraph(jobId!, page, limit, search, filter),
    enabled: !!jobId,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
