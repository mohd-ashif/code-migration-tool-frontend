import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/http/apiClient';

export interface SubscriptionAddress {
  companyName?: string;
  gstNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export function usePlans() {
  return useQuery({
    queryKey: ['billingPlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/billing/plans');
      return data.plans;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useSubscription(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingSubscription', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/billing/subscription');
      return data.subscription;
    },
    enabled: !!workspaceId || true,
  });
}

export function useUsage(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingUsage', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/billing/usage');
      return data.usage;
    },
    enabled: !!workspaceId || true,
  });
}

export function useInvoices(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingInvoices', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/billing/invoices');
      return data.invoices;
    },
    enabled: !!workspaceId || true,
  });
}

export function usePayments(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingPayments', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/billing/payments');
      return data.payments || [];
    },
    enabled: !!workspaceId || true,
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (payload: {
      planSlug: string;
      billingCycle: string;
      billingAddress: SubscriptionAddress;
      couponCode?: string;
    }) => {
      const { data } = await apiClient.post('/api/billing/checkout', payload);
      return data.checkout;
    },
  });
}

export function useBilling() {
  const queryClient = useQueryClient();

  const verifyPayment = useMutation({
    mutationFn: async (payload: {
      paymentId: string;
      signature: string;
      subscriptionId: string;
    }) => {
      const { data } = await apiClient.post('/api/billing/verify', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['billingUsage'] });
      queryClient.invalidateQueries({ queryKey: ['billingInvoices'] });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/billing/cancel');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
    },
  });

  const resumeSubscription = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/billing/resume');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
    },
  });

  const applyCoupon = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post('/api/billing/apply-coupon', { code });
      return data.coupon;
    },
  });

  return {
    verifyPayment,
    cancelSubscription,
    resumeSubscription,
    applyCoupon,
  };
}
