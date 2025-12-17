// Transaction List Component - Extracted from Zostel app
import React, { memo } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TransactionItem } from './TransactionItem';
import { walletStyles } from './styles/walletStyles';
import type { TransactionListProps } from '../../lib/types/wallet';

export const TransactionList: React.FC<TransactionListProps> = memo(
  ({ transactions, isLoading, onEndReached }) => {
    if (isLoading && !transactions?.length) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#00C853" />
        </View>
      );
    }

    if (!transactions?.length) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Complete quests to earn $Zo tokens
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.txnContent}>
        {transactions.map((transaction, index) => (
          <TransactionItem key={transaction.id || index} transaction={transaction} />
        ))}
      </View>
    );
  }
);

TransactionList.displayName = 'TransactionList';

const styles = StyleSheet.create({
  txnContent: walletStyles.txnContent,
  loader: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.44)',
    fontSize: 14,
    textAlign: 'center',
  },
});

