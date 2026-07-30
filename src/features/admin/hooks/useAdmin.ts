import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/http/apiClient';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/dashboard');
      return res.data;
    },
    refetchInterval: 30000,
  });
}

export function useAdminUsers(params?: { search?: string; status?: string; systemRole?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/users', { params });
      return { users: res.users, total: res.total };
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const res: any = await apiClient.post(`/api/admin/users/${userId}/suspend`, { reason });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res: any = await apiClient.post(`/api/admin/users/${userId}/reactivate`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminWorkspaces(params?: { search?: string; status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'workspaces', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/workspaces', { params });
      return { workspaces: res.workspaces, total: res.total };
    },
  });
}

export function useSuspendWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, reason }: { workspaceId: string; reason?: string }) => {
      const res: any = await apiClient.post(`/api/admin/workspaces/${workspaceId}/suspend`, { reason });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useReactivateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const res: any = await apiClient.post(`/api/admin/workspaces/${workspaceId}/reactivate`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminSubscriptions(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/subscriptions', { params });
      return { subscriptions: res.subscriptions, total: res.total };
    },
  });
}

export function useAdminPayments(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/payments', { params });
      return { payments: res.payments, total: res.total };
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason?: string }) => {
      const res: any = await apiClient.post(`/api/admin/payments/${paymentId}/refund`, { reason });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminJobs(params?: { search?: string; status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'jobs', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/jobs', { params });
      return { jobs: res.jobs, total: res.total };
    },
    refetchInterval: 10000,
  });
}

export function useRetryAdminJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res: any = await apiClient.post(`/api/admin/jobs/${jobId}/retry`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useCancelAdminJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res: any = await apiClient.post(`/api/admin/jobs/${jobId}/cancel`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useCompilerHealth() {
  return useQuery({
    queryKey: ['admin', 'compiler-health'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/compiler-health');
      return res.data;
    },
    refetchInterval: 15000,
  });
}

export function useAdminReports(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/reports', { params });
      return { reports: res.reports, total: res.total };
    },
  });
}

export function useAdminLogs(params?: { level?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/logs', { params });
      return { logs: res.logs, total: res.total };
    },
  });
}

export function useAdminAnalytics(days = 30) {
  return useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/analytics', { params: { days } });
      return res.analytics;
    },
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/feature-flags');
      return res.flags;
    },
  });
}

export function useSaveFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { key: string; description?: string; enabled: boolean; rolloutPercentage?: number; rules?: any }) => {
      const res: any = await apiClient.post('/api/admin/feature-flags', data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
    },
  });
}

export function useAdminAuditLogs(params?: { adminUserId?: string; action?: string; resourceType?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/audit-logs', { params });
      return { logs: res.logs, total: res.total };
    },
  });
}
