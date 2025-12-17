// Wallet Screen Component - Complete wallet screen from Zostel app
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeIn, FadeOut, FadeInUp, FadeOutUp, FadeInDown } from 'react-native-reanimated';
import { WalletCard } from './WalletCard';
import { TransactionList } from './TransactionList';
import { walletStyles } from './styles/walletStyles';
import type { WalletScreenProps } from '../../lib/types/wallet';

// Mock data for demo
const MOCK_USER = {
  avatar: {
    image: 'https://i.pravatar.cc/150?img=12',
  },
  first_name: 'John',
  nickname: '@johndoe',
  wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
};

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    created_at: '2025-12-10T10:30:00Z',
    updated_at: '2025-12-10T10:30:00Z',
    amount: 100,
    description: 'Completed profile',
    claimed_at: '2025-12-10T10:30:00Z',
    grant: {
      id: 'g1',
      name: 'Profile Completion',
      description: 'Complete your profile',
    },
    action: 'deposit' as const,
  },
  {
    id: '2',
    created_at: '2025-12-09T15:20:00Z',
    updated_at: '2025-12-09T15:20:00Z',
    amount: 250,
    description: 'Quest: Explore 3 locations',
    claimed_at: '2025-12-09T15:20:00Z',
    grant: {
      id: 'g2',
      name: 'Explorer Quest',
      description: 'Visit locations',
    },
    action: 'deposit' as const,
  },
  {
    id: '3',
    created_at: '2025-12-08T09:15:00Z',
    updated_at: '2025-12-08T09:15:00Z',
    amount: 500,
    description: 'Booking reward',
    claimed_at: '2025-12-08T09:15:00Z',
    grant: {
      id: 'g3',
      name: 'Booking Reward',
      description: 'Book a stay',
    },
    action: 'deposit' as const,
  },
];

export const WalletScreen: React.FC<WalletScreenProps> = memo(({ onBack }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In real implementation, fetch from API
  const balance = 850;
  const user = MOCK_USER;
  const transactions = MOCK_TRANSACTIONS;

  const toggleView = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsTitleVisible(scrollY > 200);
  }, []);

  const backdrop = useMemo(
    () =>
      isOpen ? (
        <Pressable onPress={toggleView} style={styles.openBg}>
          <View />
        </Pressable>
      ) : null,
    [isOpen, toggleView]
  );

  const description = useMemo(
    () =>
      isOpen ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.zoDescriptionContainer}>
          <Text style={styles.description}>
            Get Zo World coins as airdrop by completing quests, stay & trips.
          </Text>
        </Animated.View>
      ) : null,
    [isOpen]
  );

  const walletText = `${user.nickname || user.first_name}'s wallet`;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Animated.View pointerEvents="none" style={styles.titleContainer}>
          {isTitleVisible && (
            <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
              <Text style={[styles.whiteText, styles.headerTitle]}>
                {walletText}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Animated.View key="loader" entering={FadeIn} exiting={FadeOut} style={styles.loader}>
            <ActivityIndicator size="large" color="#00C853" />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.container}>
            <SafeAreaView />

            {/* Transactions */}
            <TransactionList transactions={transactions} isLoading={false} />

            {/* Backdrop */}
            {backdrop}

            {/* Wallet Card */}
            <WalletCard
              balance={balance}
              user={user}
              isOpen={isOpen}
              onToggle={toggleView}
              isLoading={isLoading}
            />

            <View style={styles.bar} />
            <SafeAreaView />
          </Animated.View>
        )}
      </ScrollView>

      {/* Description */}
      {description}
    </View>
  );
});

WalletScreen.displayName = 'WalletScreen';

const styles = StyleSheet.create({
  ...walletStyles,
  backButton: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

