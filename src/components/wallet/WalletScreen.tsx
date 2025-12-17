// Wallet Screen Component - React Native wallet screen
// Note: This component requires react-native and react-native-reanimated
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

export const WalletScreen: React.FC<WalletScreenProps> = memo(({ 
  user, 
  balance, 
  transactions, 
  isLoading: isLoadingProp = false,
  onBack 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const isLoading = isLoadingProp;

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

