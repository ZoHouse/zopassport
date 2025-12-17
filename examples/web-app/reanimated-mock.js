console.log('Reanimated Mock Loaded (Class Version)');

class LayoutAnimation {
    duration() { return this; }
    delay() { return this; }
    springify() { return this; }
    damping() { return this; }
    stiffness() { return this; }
    withCallback() { return this; }
    randomDelay() { return this; }
    build() { return () => ({ initialValues: {}, animations: {} }); } // For custom entering/exiting
}

export const FadeIn = new LayoutAnimation();
export const FadeOut = new LayoutAnimation();
export const FadeInUp = new LayoutAnimation();
export const FadeOutUp = new LayoutAnimation();
export const FadeInDown = new LayoutAnimation();
export const useSharedValue = (v) => ({ value: v });
export const useAnimatedStyle = () => ({});
export const withTiming = (v) => v;
export const withSpring = (v) => v;
export const withSequence = (v) => v;
export const withDelay = (v) => v;
export const withRepeat = (v) => v;
export const runOnJS = (fn) => fn;

export default {
    createAnimatedComponent: (c) => c,
    View: 'div',
    Text: 'span',
    Image: 'img',
    ScrollView: 'div',
};
