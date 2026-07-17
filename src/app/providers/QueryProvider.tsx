import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logger } from '../../utils/logger';

// ── Smart retry predicate ─────────────────────────────────────────────────────
// • Never retry on client-side error responses (4xx) — they won't succeed again
// • Retry once (with exponential backoff) on network/5xx errors
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (error instanceof Error) {
    // Don't retry auth / permission / not-found errors
    const msg = error.message.toLowerCase();
    if (
      msg.includes('401') || msg.includes('403') ||
      msg.includes('404') || msg.includes('422') ||
      msg.includes('unauthorized') || msg.includes('forbidden')
    ) {
      return false;
    }
  }
  return true;
}

// ── Query Client ─────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000), // 1s, 2s, …, max 10s
    },
    mutations: {
      onError: (error: unknown) => {
        const msg = error instanceof Error ? error.message : 'Mutation failed';
        logger.error('[QueryClient] Mutation error', { message: msg });
      },
    },
  },
});

// ── Provider ─────────────────────────────────────────────────────────────────

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
