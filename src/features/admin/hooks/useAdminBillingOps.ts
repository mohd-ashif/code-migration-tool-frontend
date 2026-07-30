import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/http/apiClient';

export function useAdminBillingOps() {
  return useQuery({
    queryKey: ['admin', 'billingOps'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/billing/ops');
      return res.billingOps || res.data?.billingOps;
    },
  });
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/billing/coupons');
      return (res.coupons || res.data?.coupons || []) as any[];
    },
  });
}

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; discountType: string; discountValue: number; maxRedemptions?: number; expiresAt?: string }) => {
      const res: any = await apiClient.post('/api/admin/billing/coupons', payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useExtendTrial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, days }: { subscriptionId: string; days: number }) => {
      const res: any = await apiClient.post(`/api/admin/subscriptions/${subscriptionId}/extend-trial`, { days });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billingOps'] });
    },
  });
}

export function useBillingEvents() {
  return useQuery({
    queryKey: ['admin', 'billingEvents'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/admin/billing/events');
      return (res.events || res.data?.events || []) as any[];
    },
  });
}

export function useRegenerateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const res: any = await apiClient.post(`/api/admin/invoices/${invoiceId}/regenerate`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billingOps'] });
    },
  });
}
