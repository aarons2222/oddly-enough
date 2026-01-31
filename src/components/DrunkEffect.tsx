import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

interface Props {
  enabled: boolean;
  children: React.ReactNode;
}

export function DrunkEffect({ enabled, children }: Props) {
  const swayX = useRef(new Animated.Value(0)).current;
  const swayY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (enabled) {
      // Horizontal sway
      Animated.loop(
        Animated.sequence([
          Animated.timing(swayX, {
            toValue: 8,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(swayX, {
            toValue: -8,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(swayX, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Vertical sway (slower)
      Animated.loop(
        Animated.sequence([
          Animated.timing(swayY, {
            toValue: 5,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(swayY, {
            toValue: -5,
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation wobble
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: -1,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Subtle zoom pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.02,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.99,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset
      swayX.setValue(0);
      swayY.setValue(0);
      rotate.setValue(0);
      scale.setValue(1);
    }
  }, [enabled]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: swayX },
            { translateY: swayY },
            { rotate: rotateInterpolate },
            { scale },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
