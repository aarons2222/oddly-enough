import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface Props {
  theme: {
    background: string;
    text: string;
    textMuted: string;
  };
}

const MESSAGES = [
  { emoji: '🛸', text: "Beaming down stories..." },
  { emoji: '👽', text: "Consulting the aliens..." },
  { emoji: '🔮', text: "Gazing into the crystal ball..." },
  { emoji: '🌀', text: "Opening a portal..." },
  { emoji: '🦑', text: "Summoning the weird..." },
  { emoji: '🧌', text: "Waking the news goblins..." },
  { emoji: '🌈', text: "Chasing rainbows..." },
  { emoji: '👁️', text: "The universe is watching..." },
];

export function WeirdLoader({ theme }: Props) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  useEffect(() => {
    // Gentle floating animation
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    float.start();

    // Cycle messages every 2.5s
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length);
    }, 2500);

    return () => {
      float.stop();
      clearInterval(interval);
    };
  }, []);

  const { emoji, text } = MESSAGES[messageIndex];

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emoji, { transform: [{ translateY: floatAnim }] }]}>
        {emoji}
      </Animated.Text>
      <Text style={[styles.message, { color: theme.text }]}>{text}</Text>
      <View style={styles.dots}>
        <Text style={[styles.dot, { color: '#FF6B6B' }]}>●</Text>
        <Text style={[styles.dot, { color: '#4ECDC4' }]}>●</Text>
        <Text style={[styles.dot, { color: '#FFE66D' }]}>●</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    fontSize: 12,
  },
});
