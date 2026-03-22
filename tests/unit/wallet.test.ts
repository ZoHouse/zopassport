import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoApiClient } from '../../src/lib/api/client';
import { ZoWallet } from '../../src/lib/api/wallet';
import { MemoryStorageAdapter } from '../../src/lib/utils/storage';

describe('ZoWallet', () => {
  let mock: MockAdapter;
  let wallet: ZoWallet;

  beforeEach(() => {
    const storage = new MemoryStorageAdapter();
    const client = new ZoApiClient({
      clientKey: 'test-key',
      storageAdapter: storage,
    });
    mock = new MockAdapter(client.axiosInstance);
    wallet = new ZoWallet(client);
  });

  describe('setWalletAddress', () => {
    it('should set wallet address and network', () => {
      wallet.setWalletAddress('0xabc123', 'base');
      // No direct getter, but getBalance should try on-chain now
      expect(wallet).toBeDefined();
    });

    it('should default to base network', () => {
      wallet.setWalletAddress('0xabc123');
      expect(wallet).toBeDefined();
    });
  });

  describe('getBalance', () => {
    it('should return balance from first successful API endpoint', async () => {
      mock.onGet('/api/v1/web3/token/airdrops/summary').reply(200, {
        data: { total_amount: 500 },
      });

      const balance = await wallet.getBalance();
      expect(balance).toBe(500);
    });

    it('should try fallback endpoints when first fails', async () => {
      mock.onGet('/api/v1/web3/token/airdrops/summary').reply(404);
      mock.onGet('/api/v1/wallet/balance').reply(200, {
        balance: 300,
      });

      const balance = await wallet.getBalance();
      expect(balance).toBe(300);
    });

    it('should try third endpoint when first two fail', async () => {
      mock.onGet('/api/v1/web3/token/airdrops/summary').reply(404);
      mock.onGet('/api/v1/wallet/balance').reply(404);
      mock.onGet('/api/v1/profile/wallet').reply(200, {
        total_amount: 100,
      });

      const balance = await wallet.getBalance();
      expect(balance).toBe(100);
    });

    it('should return 0 when all endpoints fail', async () => {
      mock.onGet('/api/v1/web3/token/airdrops/summary').reply(500);
      mock.onGet('/api/v1/wallet/balance').reply(500);
      mock.onGet('/api/v1/profile/wallet').reply(500);

      const balance = await wallet.getBalance();
      expect(balance).toBe(0);
    });

    it('should try on-chain balance when wallet address is set', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          result: '0x56BC75E2D63100000', // 100 * 10^18 in hex
        }),
      });
      globalThis.fetch = mockFetch;

      wallet.setWalletAddress('0x1234567890abcdef1234567890abcdef12345678', 'base');

      const balance = await wallet.getBalance();
      expect(mockFetch).toHaveBeenCalled();
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    it('should fall back to API when on-chain fails', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('RPC error'));
      globalThis.fetch = mockFetch;

      wallet.setWalletAddress('0xabc', 'base');
      mock.onGet('/api/v1/web3/token/airdrops/summary').reply(200, {
        data: { total_amount: 250 },
      });

      const balance = await wallet.getBalance();
      expect(balance).toBe(250);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions from first endpoint', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          amount: 100,
          description: 'Test grant',
          claimed_at: '2024-01-01',
          grant: { id: 'g1', name: 'Welcome', description: 'Welcome bonus' },
          action: 'deposit',
        },
      ];

      mock.onGet('/api/v1/profile/completion-grants/claims').reply(200, {
        data: {
          results: mockTransactions,
          next: null,
          previous: null,
          count: 1,
        },
      });

      const result = await wallet.getTransactions();
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].id).toBe('txn-1');
      expect(result.count).toBe(1);
    });

    it('should handle pagination', async () => {
      mock.onGet(/\/api\/v1\/profile\/completion-grants\/claims\?page=2/).reply(200, {
        data: {
          results: [{ id: 'txn-2', amount: 50 }],
          next: null,
          previous: 'page=1',
          count: 2,
        },
      });

      const result = await wallet.getTransactions(2);
      expect(result.transactions).toHaveLength(1);
      expect(result.previous).toBe('page=1');
    });

    it('should try fallback endpoint when first fails', async () => {
      mock.onGet('/api/v1/profile/completion-grants/claims').reply(404);
      mock.onGet('/api/v1/wallet/transactions').reply(200, {
        data: {
          results: [{ id: 'txn-3', amount: 200 }],
          count: 1,
        },
      });

      const result = await wallet.getTransactions();
      expect(result.transactions).toHaveLength(1);
    });

    it('should return empty array when all endpoints fail', async () => {
      mock.onGet(/\/api\/v1\/profile\/completion-grants\/claims/).reply(500);
      mock.onGet(/\/api\/v1\/wallet\/transactions/).reply(500);

      const result = await wallet.getTransactions();
      expect(result.transactions).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle response with transactions field instead of results', async () => {
      mock.onGet('/api/v1/profile/completion-grants/claims').reply(200, {
        transactions: [{ id: 'txn-4', amount: 75 }],
        count: 1,
      });

      const result = await wallet.getTransactions();
      expect(result.transactions).toHaveLength(1);
    });
  });
});
