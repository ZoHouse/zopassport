// Mock for react-native-reanimated on web
// Provides basic functionality that works in browser

import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native-web';

// Create animated versions of components
const createAnimatedComponent = (Component) => {
  const AnimatedComponent = ({ style, ...props }) => {
    return <Component style={style} {...props} />;
  };
  AnimatedComponent.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
  return AnimatedComponent;
};

const Animated = {
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(Text),
  Image: createAnimatedComponent(Image),
  ScrollView: createAnimatedComponent(ScrollView),
  createAnimatedComponent,
};

// Hooks
export function useSharedValue(initialValue) {
  return { value: initialValue };
}

export function useAnimatedStyle(worklet) {
  return worklet();
}

export function useDerivedValue(worklet) {
  return { value: worklet() };
}

export function useAnimatedScrollHandler() {
  return {};
}

// Animation functions
export function withTiming(toValue, config, callback) {
  return toValue;
}

export function withSpring(toValue, config, callback) {
  return toValue;
}

export function withDelay(delay, animation) {
  return animation;
}

export function withRepeat(animation, numberOfReps, reverse, callback) {
  return animation;
}

export function withSequence(...animations) {
  return animations[animations.length - 1];
}

export function interpolate(value, inputRange, outputRange) {
  return outputRange[0];
}

export const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t,
  cubic: (t) => t,
  bezier: () => (t) => t,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
};

// Layout animations
export const FadeIn = { duration: () => FadeIn };
export const FadeOut = { duration: () => FadeOut };
export const FadeInUp = { duration: () => FadeInUp };
export const FadeOutUp = { duration: () => FadeOutUp };
export const FadeInDown = { duration: () => FadeInDown };
export const SlideInRight = { duration: () => SlideInRight };
export const SlideOutLeft = { duration: () => SlideOutLeft };

// Functions
export function runOnJS(fn) {
  return fn;
}

export function runOnUI(fn) {
  return fn;
}

export function cancelAnimation() {}

export default Animated;






