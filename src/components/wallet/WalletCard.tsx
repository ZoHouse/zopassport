// Wallet Card Component - Extracted from Zostel app
import React, { memo, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { MovingShine } from './MovingShine';
import { ZoTokenVideo } from './ZoToken';
import { WALLET_ASSETS, ANIMATIONS } from '../../../assets/wallet/constants';
import { walletStyles } from './styles/walletStyles';
import { formatBalance, formatWalletAddress, formatNickname } from '../../lib/utils/wallet';
import type { WalletCardProps } from '../../lib/types/wallet';

export const WalletCard: React.FC<WalletCardProps> = memo(
  ({ balance, user, isOpen = false, onToggle, isLoading }) => {
    const bgY = useSharedValue(0);
    const cardY = useSharedValue(0);

    const animatedBackgroundStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: bgY.value }],
    }));

    const animatedCardStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: cardY.value }],
    }));

    useEffect(() => {
      bgY.value = withTiming(isOpen ? 200 : 0, { duration: ANIMATIONS.cardTransition });
      cardY.value = withTiming(isOpen ? -150 : 0, { duration: ANIMATIONS.cardTransition });
    }, [isOpen]);

    const displayName = user.nickname
      ? formatNickname(user.nickname)
      : user.first_name || 'You';

    const walletText = `${displayName}'s wallet`;

    return (
      <Pressable
        style={styles.cardPressContainer}
        onPress={onToggle}
      >
        <Animated.View style={[styles.card, animatedBackgroundStyle]}>
          {/* Background Image */}
          <Image
            source={{ uri: WALLET_ASSETS.walletBackground }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="contain"
          />

          {/* Shadow */}
          <Animated.View
            style={styles.cardShadow}
            entering={FadeIn.duration(ANIMATIONS.fadeInDuration)}
          />

          {/* Card Content */}
          <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
            <View style={styles.cardContent}>
              {/* Balance Row */}
              <View style={styles.balanceRow}>
                <View style={styles.balanceWrapper}>
                  <Text style={[styles.whiteText, styles.balanceAmount]}>
                    {formatBalance(balance)}
                  </Text>
                  <Text style={[styles.grayText, styles.currency]}>
                    $Zo
                  </Text>
                </View>
                <ZoTokenVideo size={24} />
              </View>

              <View style={styles.flex} />

              {/* User Info */}
              {user && (
                <View style={styles.avatarInfo}>
                  {user.avatar?.image && (
                    <Image
                      source={{ uri: user.avatar.image }}
                      style={styles.avatar}
                    />
                  )}
                  <View style={styles.flex}>
                    <Text style={[styles.whiteText, styles.userName]}>
                      {displayName}
                    </Text>
                    <Text style={[styles.grayText, styles.walletAddress]}>
                      {formatWalletAddress(user.wallet_address || '')}
                    </Text>
                  </View>
                </View>
              )}

              {/* Shine Effect */}
              <View style={styles.shineContainer}>
                <MovingShine />
              </View>
            </View>
          </Animated.View>

          {/* Card Cover */}
          <View style={styles.cardCover}>
            <Image
              source={{ uri: WALLET_ASSETS.walletCover }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.cardCoverTextContainer}>
              <Text style={[styles.grayText, styles.cardCoverText]}>
                {walletText}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    );
  }
);

WalletCard.displayName = 'WalletCard';

const styles = StyleSheet.create({
  ...walletStyles,
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  currency: {
    fontSize: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cardCoverText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

