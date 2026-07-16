import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { UsageDto } from '../shared/types/api.types';

async function fetchUsage(): Promise<UsageDto> {
  const res: any = await apiClient.get('/api/workspace/usage');
  return res.data;
}

export function useUsage() {
  const query = useQuery<UsageDto>({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    staleTime: 60 * 1000, // Refresh every minute
    retry: 1,
  });

  return {
    usage: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
