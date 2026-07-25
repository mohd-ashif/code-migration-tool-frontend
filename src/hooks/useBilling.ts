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

export interface PaymentFilterParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function usePlans() {
  return useQuery({
    queryKey: ['billingPlans'],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/billing/plans');
      return res.plans;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscription(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingSubscription', workspaceId],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/billing/subscription');
      return res.subscription;
    },
    enabled: !!workspaceId || true,
  });
}

export function useUsage(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingUsage', workspaceId],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/billing/usage');
      return res.usage;
    },
    enabled: !!workspaceId || true,
  });
}

export function useInvoices(workspaceId?: string) {
  return useQuery({
    queryKey: ['billingInvoices', workspaceId],
    queryFn: async () => {
      const res: any = await apiClient.get('/api/invoices');
      return res.invoices || [];
    },
    enabled: !!workspaceId || true,
  });
}

export function usePayments(params?: PaymentFilterParams) {
  return useQuery({
    queryKey: ['billingPayments', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.set('search', params.search);
      if (params?.status) queryParams.set('status', params.status);
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));

      const url = `/api/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res: any = await apiClient.get(url);
      return res;
    },
  });
}

export function usePaymentHistory(params?: PaymentFilterParams) {
  return usePayments(params);
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (payload: {
      planSlug: string;
      billingCycle: string;
      billingAddress: SubscriptionAddress;
      couponCode?: string;
      gatewayName?: string;
    }) => {
      const res: any = await apiClient.post('/api/payments/checkout', payload);
      return res.checkout;
    },
  });
}

export function useSubscriptionRenew() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res: any = await apiClient.post('/api/subscription/renew');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['billingUsage'] });
      queryClient.invalidateQueries({ queryKey: ['billingInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['billingPayments'] });
    },
  });
}

export function useRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { paymentId: string; amount?: number; reason?: string }) => {
      const res: any = await apiClient.post(`/api/payments/${payload.paymentId}/refund`, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['billingInvoices'] });
    },
  });
}

export function useRetryPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const res: any = await apiClient.post(`/api/payments/${paymentId}/retry`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingPayments'] });
    },
  });
}

export function useBilling() {
  const queryClient = useQueryClient();

  const verifyPayment = useMutation({
    mutationFn: async (payload: {
      paymentId: string;
      signature: string;
      subscriptionId?: string;
      orderId?: string;
      planSlug?: string;
    }) => {
      const res: any = await apiClient.post('/api/payments/verify', payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['billingUsage'] });
      queryClient.invalidateQueries({ queryKey: ['billingInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['billingPayments'] });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const res: any = await apiClient.post('/api/subscription/cancel');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
    },
  });

  const resumeSubscription = useMutation({
    mutationFn: async () => {
      const res: any = await apiClient.post('/api/subscription/resume');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
    },
  });

  const applyCoupon = useMutation({
    mutationFn: async (code: string) => {
      const res: any = await apiClient.post('/api/billing/apply-coupon', { code });
      return res.coupon;
    },
  });

  const saveAddress = useMutation({
    mutationFn: async (payload: SubscriptionAddress) => {
      const res: any = await apiClient.post('/api/billing/address', payload);
      return res.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingSubscription'] });
    }
  });

  return {
    verifyPayment,
    cancelSubscription,
    resumeSubscription,
    applyCoupon,
    saveAddress,
  };
}
