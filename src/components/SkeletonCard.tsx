import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

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
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const [message] = useState(() => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
  const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Image placeholder with emoji */}
      <View style={[styles.image, { backgroundColor: theme.border }]}>
        <Text style={styles.bigEmoji}>{emoji}</Text>
      </View>
      
      <View style={styles.content}>
        <Animated.View style={[styles.badge, { opacity: pulseAnim, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.title, { opacity: pulseAnim, backgroundColor: theme.border }]} />
        <Animated.View style={[styles.titleShort, { opacity: pulseAnim, backgroundColor: theme.border }]} />
        
        {/* Loading message */}
        <Text style={styles.loadingMessage}>{message}</Text>
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
  bigEmoji: {
    fontSize: 56,
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
  loadingMessage: {
    fontSize: 14,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
});
