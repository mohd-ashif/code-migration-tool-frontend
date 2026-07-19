import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { CompilerHealthDto } from '../shared/types/framework.types';

export function useCompilerHealth() {
  return useQuery<CompilerHealthDto>({
    queryKey: ['compilerHealth'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/compiler/health');
      return res.data;
    },
    refetchInterval: 30000, // Poll every 30s
    refetchIntervalInBackground: true,
  });
}
