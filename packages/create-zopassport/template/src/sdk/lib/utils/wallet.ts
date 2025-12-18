// Wallet Formatting Utilities
// Framework-agnostic pure functions for wallet data formatting

/**
 * Format balance number with commas
 * @param balance - Raw balance number
 * @returns Formatted string (e.g., "1,234.56")
 */
export const formatBalance = (balance: number): string => {
    if (balance === 0) return '0';

    const formatted = balance.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return formatted;
};

/**
 * Format balance for short display
 * @param balance - Raw balance number
 * @returns Shortened string (e.g., "1.2K", "1.5M")
 */
export const formatBalanceShort = (balance: number): string => {
    if (balance === 0) return '0';
    if (balance < 1000) return formatBalance(balance);
    if (balance < 1000000) return `${(balance / 1000).toFixed(1)}K`;
    return `${(balance / 1000000).toFixed(1)}M`;
};

/**
 * Format wallet address to short form
 * @param address - Full wallet address
 * @returns Shortened address (e.g., "0x12...34ab")
 */
export const formatWalletAddress = (address: string): string => {
    if (!address || address.length < 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

/**
 * Format nickname with @ prefix
 * @param nickname - User nickname
 * @returns Formatted nickname (e.g., "@john")
 */
export const formatNickname = (nickname: string): string => {
    if (!nickname) return '';
    return nickname.startsWith('@') ? nickname : `@${nickname}`;
};

/**
 * Format transaction amount
 * @param amount - Transaction amount
 * @param action - deposit or spend
 * @returns Formatted amount with +/- prefix
 */
export const formatTransactionAmount = (
    amount: number,
    action: 'deposit' | 'spend'
): string => {
    const formatted = formatBalance(amount);
    return action === 'spend' ? `- ${formatted}` : `+ ${formatted}`;
};

/**
 * Get transaction color
 * @param action - deposit or spend
 * @returns Color hex code
 */
export const getTransactionColor = (action: 'deposit' | 'spend'): string => {
    return action === 'spend' ? '#FF4444' : '#00C853';
};
