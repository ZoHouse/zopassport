// $Zo Token Components - Extracted from Zostel app
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Zo coin asset path (served from assets folder)
const ZO_COIN_GIF = '/zo-coin.gif';

interface ZoTokenProps {
  size?: number;
  style?: any;
  /** Custom source URL for the Zo coin */
  source?: string;
}

/**
 * Static $Zo Token Icon - uses the animated zo-coin.gif
 */
export const ZoToken: React.FC<ZoTokenProps> = ({ size = 16, style, source = ZO_COIN_GIF }) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={{ uri: source }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

/**
 * Animated $Zo Token Video Component
 * Uses the zo-coin.gif animated image
 */
export const ZoTokenVideo: React.FC<ZoTokenProps> = ({ size = 24, style, source = ZO_COIN_GIF }) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Image
        source={{ uri: source }}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

