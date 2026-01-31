import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  theme: {
    card: string;
    border: string;
  };
}

export function SkeletonCard({ theme }: Props) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Animated.View style={[styles.image, { opacity, backgroundColor: theme.border }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.badge, { opacity, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.title, { opacity, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.titleShort, { opacity, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.summary, { opacity, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.summaryShort, { opacity, backgroundColor: theme.border }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#2a2a2a',
  },
  content: {
    padding: 16,
  },
  badge: {
    width: 80,
    height: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    width: '100%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  titleShort: {
    width: '70%',
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  summary: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  summaryShort: {
    width: '85%',
    height: 14,
    borderRadius: 4,
  },
});
