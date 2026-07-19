import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';
import { SupportedMigrationDto } from '../shared/types/framework.types';

export function useMigrationMatrix() {
  return useQuery<SupportedMigrationDto[]>({
    queryKey: ['migrationMatrix'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/migration-matrix');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
