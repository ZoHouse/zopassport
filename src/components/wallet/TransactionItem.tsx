// Transaction Item Component - Extracted from Zostel app
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ZoToken } from './ZoToken';
import { walletStyles } from './styles/walletStyles';
import { formatBalance, getTransactionColor } from '../../lib/utils/wallet';
import type { TransactionItemProps } from '../../lib/types/wallet';

const StatusIcon: React.FC = memo(() => {
  return (
    <View style={styles.iconBgTilted}>
      <Text style={styles.iconText}>←</Text>
    </View>
  );
});

StatusIcon.displayName = 'StatusIcon';

export const TransactionItem: React.FC<TransactionItemProps> = memo(
  ({ transaction, showDate = true }) => {
    const color = getTransactionColor(transaction.action);
    const formattedAmount = formatBalance(transaction.amount);

    return (
      <View style={styles.txnRow}>
        <StatusIcon />
        
        <View style={styles.flex}>
          <Text style={styles.description}>{transaction.description}</Text>
          {showDate && transaction.claimed_at && (
            <Text style={styles.date}>
              {new Date(transaction.claimed_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ' ' + new Date(transaction.claimed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          )}
        </View>

        <View style={styles.tokenContainer}>
          <Text
            style={[
              styles.textShadow,
              {
                shadowColor: color,
                color: color,
                fontWeight: '600',
                fontSize: 16,
              },
            ]}
          >
            + {formattedAmount}
          </Text>
          <ZoToken size={16} />
        </View>
      </View>
    );
  }
);

TransactionItem.displayName = 'TransactionItem';

const styles = StyleSheet.create({
  txnRow: walletStyles.txnRow,
  iconBgTilted: walletStyles.iconBgTilted,
  tokenContainer: walletStyles.tokenContainer,
  textShadow: walletStyles.textShadow,
  flex: {
    flex: 1,
  },
  iconText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  date: {
    color: 'rgba(255, 255, 255, 0.44)',
    fontSize: 12,
    marginTop: 2,
  },
});

