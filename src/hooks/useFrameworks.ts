import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { FrameworkDto, FrameworkDetailDto } from '../shared/types/framework.types';

export function useFrameworks() {
  return useQuery<FrameworkDto[]>({
    queryKey: ['frameworks'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/frameworks');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useFrameworkDetail(id: string | null) {
  return useQuery<FrameworkDetailDto>({
    queryKey: ['frameworkDetail', id],
    queryFn: async () => {
      if (!id) throw new Error('No framework ID provided');
      const res: any = await apiClient.get(`/api/frameworks/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
