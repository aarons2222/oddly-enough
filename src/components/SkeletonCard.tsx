import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface Props {
  theme: {
    card: string;
    border: string;
  };
}

const LOADING_MESSAGES = [
  "Hunting for weird news...",
  "Asking the aliens...",
  "Consulting the oracle...",
  "Checking under rocks...",
  "Summoning oddities...",
  "Poking the internet...",
  "Bribing news goblins...",
  "Decoding strange signals...",
  "Following the breadcrumbs...",
  "Waking the night owls...",
];

const EMOJIS = ['👽', '🛸', '🔮', '🌀', '👁️', '🦑', '🎪', '🌈', '🦄', '🐙'];

export function SkeletonCard({ theme }: Props) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [message] = useState(() => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
  const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

  useEffect(() => {
    // Shimmer animation
    const shimmer = Animated.loop(
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

    // Bounce animation for emoji
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Spin animation
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    shimmer.start();
    bounce.start();
    spin.start();

    return () => {
      shimmer.stop();
      bounce.stop();
      spin.stop();
    };
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Fun image placeholder */}
      <View style={[styles.image, { backgroundColor: theme.border }]}>
        <View style={styles.imageContent}>
          <Animated.Text 
            style={[
              styles.bigEmoji, 
              { 
                transform: [
                  { translateY: bounceAnim },
                  { rotate: rotation }
                ] 
              }
            ]}
          >
            {emoji}
          </Animated.Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {/* Animated placeholder lines with personality */}
        <Animated.View style={[styles.badge, { opacity, backgroundColor: theme.border }]}>
          <Text style={styles.badgeText}>✨ ???</Text>
        </Animated.View>
        
        <Animated.View style={[styles.title, { opacity, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.titleShort, { opacity, backgroundColor: theme.border }]} />
        
        {/* Loading message */}
        <View style={styles.messageContainer}>
          <Animated.Text style={[styles.loadingMessage, { opacity: shimmerAnim }]}>
            {message}
          </Animated.Text>
        </View>
        
        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { 
                  backgroundColor: '#FF6B6B',
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: i === 0 ? [1, 0.3, 1] : i === 1 ? [0.3, 1, 0.3] : [0.6, 0.6, 0.6],
                  }),
                  transform: [{
                    scale: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: i === 0 ? [1, 0.8, 1] : i === 1 ? [0.8, 1, 0.8] : [0.9, 0.9, 0.9],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 64,
  },
  content: {
    padding: 16,
  },
  badge: {
    width: 80,
    height: 28,
    borderRadius: 14,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
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
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  loadingMessage: {
    fontSize: 14,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
