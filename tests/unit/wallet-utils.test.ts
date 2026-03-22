import { describe, it, expect } from 'vitest';
import {
  formatBalance,
  formatBalanceShort,
  formatWalletAddress,
  formatNickname,
  formatTransactionAmount,
  getTransactionColor,
} from '../../src/lib/utils/wallet';

describe('formatBalance', () => {
  it('should return "0" for zero', () => {
    expect(formatBalance(0)).toBe('0');
  });

  it('should format whole numbers with commas', () => {
    expect(formatBalance(1234)).toBe('1,234');
  });

  it('should format large numbers', () => {
    expect(formatBalance(1000000)).toBe('1,000,000');
  });

  it('should handle decimals up to 2 places', () => {
    const result = formatBalance(1234.567);
    expect(result).toBe('1,234.57');
  });

  it('should not add trailing zeros for whole numbers', () => {
    expect(formatBalance(100)).toBe('100');
  });
});

describe('formatBalanceShort', () => {
  it('should return "0" for zero', () => {
    expect(formatBalanceShort(0)).toBe('0');
  });

  it('should return formatted number below 1000', () => {
    expect(formatBalanceShort(500)).toBe('500');
  });

  it('should format thousands with K suffix', () => {
    expect(formatBalanceShort(1500)).toBe('1.5K');
  });

  it('should format millions with M suffix', () => {
    expect(formatBalanceShort(2500000)).toBe('2.5M');
  });

  it('should handle exact 1000', () => {
    expect(formatBalanceShort(1000)).toBe('1.0K');
  });
});

describe('formatWalletAddress', () => {
  it('should shorten a valid address', () => {
    expect(formatWalletAddress('0x1234567890abcdef')).toBe('0x12...cdef');
  });

  it('should return short address as-is', () => {
    expect(formatWalletAddress('0x1234')).toBe('0x1234');
  });

  it('should handle empty string', () => {
    expect(formatWalletAddress('')).toBe('');
  });
});

describe('formatNickname', () => {
  it('should add @ prefix', () => {
    expect(formatNickname('john')).toBe('@john');
  });

  it('should not double-prefix', () => {
    expect(formatNickname('@john')).toBe('@john');
  });

  it('should return empty for empty string', () => {
    expect(formatNickname('')).toBe('');
  });
});

describe('formatTransactionAmount', () => {
  it('should prefix + for deposits', () => {
    expect(formatTransactionAmount(100, 'deposit')).toBe('+ 100');
  });

  it('should prefix - for spends', () => {
    expect(formatTransactionAmount(50, 'spend')).toBe('- 50');
  });

  it('should format large amounts with commas', () => {
    expect(formatTransactionAmount(10000, 'deposit')).toBe('+ 10,000');
  });
});

describe('getTransactionColor', () => {
  it('should return green for deposits', () => {
    expect(getTransactionColor('deposit')).toBe('#00C853');
  });

  it('should return red for spends', () => {
    expect(getTransactionColor('spend')).toBe('#FF4444');
  });
});
