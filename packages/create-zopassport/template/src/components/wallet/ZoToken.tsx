// $Zo Token Components - Extracted from Zostel app
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface ZoTokenProps {
  size?: number;
  style?: any;
}

/**
 * Static $Zo Token Icon
 */
export const ZoToken: React.FC<ZoTokenProps> = ({ size = 16, style }) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Defs>
          <LinearGradient id="zoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E676" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00C853" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="16" fill="url(#zoGradient)" />
        <Path
          d="M9 11h14l-10 10h10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

/**
 * Animated $Zo Token Video Component
 * Note: In production this uses a video/lottie animation
 * This is a simplified static version
 */
export const ZoTokenVideo: React.FC<ZoTokenProps> = ({ size = 24, style }) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size,
          overflow: 'hidden',
          backgroundColor: '#00C853',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <ZoToken size={size * 0.6} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

