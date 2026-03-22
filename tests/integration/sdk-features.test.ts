import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ZoPassportSDK } from '../../src/ZoPassportSDK';
import { MemoryStorageAdapter, STORAGE_KEYS } from '../../src/lib/utils/storage';

describe('ZoPassportSDK Features', () => {
  let sdk: ZoPassportSDK;
  let storage: MemoryStorageAdapter;
  let mock: MockAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    sdk = new ZoPassportSDK({
      clientKey: 'test-client-key',
      storageAdapter: storage,
      autoRefresh: false,
    });
    mock = new MockAdapter(sdk.auth['client'].axiosInstance);
  });

  afterEach(() => {
    sdk.destroy();
    mock.restore();
  });

  describe('getWalletBalance', () => {
    it('should return balance from API', async () => {
      mock.onGet('/api/v1/web3/token/airdrops/summary').reply(200, {
        data: { total_amount: 1000 },
      });
      const balance = await sdk.getWalletBalance();
      expect(balance).toBe(1000);
    });
  });

  describe('getWalletTransactions', () => {
    it('should return transactions', async () => {
      mock.onGet('/api/v1/profile/completion-grants/claims').reply(200, {
        data: {
          results: [{ id: 'txn-1', amount: 100, action: 'deposit', description: 'Welcome' }],
          count: 1,
        },
      });
      const result = await sdk.getWalletTransactions();
      expect(result.transactions).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should stop auto refresh on destroy', () => {
      const sdkWithRefresh = new ZoPassportSDK({
        clientKey: 'test-key',
        storageAdapter: storage,
        autoRefresh: true,
        refreshInterval: 60000,
      });
      sdkWithRefresh.destroy();
      sdkWithRefresh.destroy(); // Double destroy should be safe
    });
  });
});
