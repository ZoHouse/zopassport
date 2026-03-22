// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWalletBalance } from '../../src/hooks/useWalletBalance';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useWallet } from '../../src/hooks/useWallet';

describe('useWalletBalance', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('should return error when no API client provided', async () => {
    const { result } = renderHook(() => useWalletBalance(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBe(0);
    expect(result.current.error).toBeDefined();
    expect(result.current.error!.message).toBe('API client not provided');
  });

  it('should fetch balance from API', async () => {
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: { total_amount: 500 } },
      }),
    };

    const { result } = renderHook(() => useWalletBalance(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBe(500);
    expect(result.current.error).toBeNull();
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/web3/token/airdrops/summary');
  });

  it('should handle API error', async () => {
    const mockClient = {
      get: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    const { result } = renderHook(() => useWalletBalance(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBe(0);
    expect(result.current.error).toBeDefined();
  });

  it('should refetch when called', async () => {
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: { total_amount: 100 } },
      }),
    };

    const { result } = renderHook(() => useWalletBalance(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockClient.get.mockResolvedValue({
      data: { data: { total_amount: 200 } },
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.balance).toBe(200);
  });

  it('should default to 0 when total_amount is undefined', async () => {
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: {} },
      }),
    };

    const { result } = renderHook(() => useWalletBalance(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBe(0);
  });
});

describe('useTransactions', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('should return error when no API client provided', async () => {
    const { result } = renderHook(() => useTransactions(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('should fetch transactions from API', async () => {
    const mockTransactions = [
      { id: 'txn-1', amount: 100, description: 'Test', action: 'deposit' },
    ];
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: { results: mockTransactions, next: null } },
      }),
    };

    const { result } = renderHook(() => useTransactions(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].id).toBe('txn-1');
    expect(result.current.hasMore).toBe(false);
  });

  it('should set hasMore when next exists', async () => {
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: { results: [], next: 'page=2' } },
      }),
    };

    const { result } = renderHook(() => useTransactions(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasMore).toBe(true);
  });

  it('should handle API error', async () => {
    const mockClient = {
      get: vi.fn().mockRejectedValue(new Error('Failed')),
    };

    const { result } = renderHook(() => useTransactions(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.transactions).toEqual([]);
  });

  it('should use custom limit option', async () => {
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: { results: [], next: null } },
      }),
    };

    renderHook(() => useTransactions(mockClient as any, { limit: 5 }));

    await waitFor(() => {
      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/completion-grants/claims',
        { params: { limit: 5 } }
      );
    });
  });
});

describe('useWallet (combined)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('should return error when no API client', async () => {
    const { result } = renderHook(() => useWallet(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.balance).toBe(0);
    expect(result.current.transactions).toEqual([]);
  });

  it('should fetch both balance and transactions', async () => {
    const mockClient = {
      get: vi.fn().mockImplementation((url: string) => {
        if (url.includes('airdrops')) {
          return Promise.resolve({ data: { data: { total_amount: 750 } } });
        }
        return Promise.resolve({
          data: { data: { results: [{ id: 'txn-1', amount: 100 }], next: null } },
        });
      }),
    };

    const { result } = renderHook(() => useWallet(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBe(750);
    expect(result.current.transactions).toHaveLength(1);
  });

  it('should refetch all on refetch()', async () => {
    const mockClient = {
      get: vi.fn().mockResolvedValue({
        data: { data: { total_amount: 0, results: [], next: null } },
      }),
    };

    const { result } = renderHook(() => useWallet(mockClient as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    // get called for both balance and transactions on initial + refetch
    expect(mockClient.get).toHaveBeenCalledTimes(4); // 2 initial + 2 refetch
  });
});
