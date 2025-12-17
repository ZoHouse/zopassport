// Moving Shine Effect - Extracted from Zostel app
import React, { memo, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { WALLET_ASSETS, ANIMATIONS } from '../../../assets/wallet/constants';
import { walletStyles } from './styles/walletStyles';
import type { MovingShineProps } from '../../lib/types/wallet';

export const MovingShine: React.FC<MovingShineProps> = memo(
  ({ duration = ANIMATIONS.shineDuration }) => {
    const tx = useSharedValue(-100);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: '30deg' }, { translateX: tx.value }],
    }));

    useEffect(() => {
      tx.value = withRepeat(withTiming(420, { duration }), -1, false);
    }, [duration]);

    return (
      <Animated.View style={[styles.shineEffect, animatedStyle]}>
        <Image
          source={{ uri: WALLET_ASSETS.shine }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      </Animated.View>
    );
  }
);

MovingShine.displayName = 'MovingShine';

const styles = StyleSheet.create({
  shineEffect: walletStyles.shineEffect,
});

