// Transactions Hook - Extracted from Zostel app
import { useState, useEffect, useCallback } from 'react';
import type { AxiosInstance } from 'axios';
import type { Transaction } from '../lib/types';

// Minimal interface for API client (Axios-compatible)
interface ApiClient {
  get: AxiosInstance['get'];
}

interface UseTransactionsOptions {
  limit?: number;
  autoRefetch?: boolean;
}

/**
 * Hook to fetch transaction history
 * Uses API: GET /api/v1/profile/completion-grants/claims
 * 
 * @param apiClient - Axios instance or compatible client with .get() method
 * @param options - Configuration options
 */
export const useTransactions = (
  apiClient?: ApiClient | null,
  options?: UseTransactionsOptions
) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!apiClient) {
      setError(new Error('API client not provided'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/v1/profile/completion-grants/claims', {
        params: {
          limit: options?.limit || 20,
        },
      });

      const results = response.data?.data?.results ?? [];
      setTransactions(results);
      setHasMore(!!response.data?.data?.next);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, options?.limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    // TODO: Implement pagination logic
  }, [hasMore, isLoading]);

  useEffect(() => {
    fetchTransactions();

    if (options?.autoRefetch) {
      const interval = setInterval(fetchTransactions, 60000); // Refetch every minute
      return () => clearInterval(interval);
    }
  }, [fetchTransactions, options?.autoRefetch]);

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    refetch: fetchTransactions,
    loadMore,
  };
};
