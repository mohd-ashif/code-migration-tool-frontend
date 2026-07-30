import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/http/apiClient';

export interface MigrationJobData {
  id: string;
  status: string;
  stage?: string;
  progress: number;
  message?: string;
  result?: any;
  request?: any;
  projectName?: string;
  sourceFramework?: string;
  targetFramework?: string;
  attemptCount?: number;
  queuedAt?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
}

export function useCreateMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { projectFiles: any[]; targetFramework: string; sourceFramework?: string }) => {
      const res: any = await apiClient.post('/api/migrations', payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migrationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    },
  });
}

export function useMigration(jobId?: string) {
  return useQuery({
    queryKey: ['migration', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res: any = await apiClient.get(`/api/migrations/${jobId}`);
      return res.job as MigrationJobData;
    },
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (['COMPLETED', 'FAILED', 'CANCELLED', 'completed', 'failed', 'cancelled'].includes(data.status)) {
        return false;
      }
      return 3000;
    },
  });
}

export function useMigrationHistory(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['migrationHistory', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
      const res: any = await apiClient.get(`/api/migrations?${params.toString()}`);
      return { jobs: (res.jobs || []) as MigrationJobData[], total: res.total || 0 };
    },
    staleTime: 10 * 1000,
  });
}

export function useRetryMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res: any = await apiClient.post(`/api/migrations/${jobId}/retry`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migrationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    },
  });
}

export function usePauseMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res: any = await apiClient.post(`/api/migrations/${jobId}/pause`);
      return res;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['migration', jobId] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    },
  });
}

export function useResumeMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res: any = await apiClient.post(`/api/migrations/${jobId}/resume`);
      return res;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['migration', jobId] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    },
  });
}

export function useCancelMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res: any = await apiClient.post(`/api/migrations/${jobId}/cancel`);
      return res;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['migration', jobId] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
      queryClient.invalidateQueries({ queryKey: ['migrationHistory'] });
    },
  });
}

export function useMigrationEvents(jobId?: string) {
  return useQuery({
    queryKey: ['migrationEvents', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const res: any = await apiClient.get(`/api/migrations/${jobId}/events`);
      return res.events || [];
    },
    enabled: Boolean(jobId),
    refetchInterval: 5000,
  });
}
