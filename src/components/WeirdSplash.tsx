import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { ScreenBugs } from './ScreenBugs';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const FLOATING_EMOJIS = ['👽', '🛸', '🦆', '🦩', '🌮', '🧻', '🪿', '🦔', '🍕', '🎺', '🪗', '🦑'];

interface FloatingEmojiProps {
  emoji: string;
  delay: number;
  startX: number;
}

function FloatingEmoji({ emoji, delay, startX }: FloatingEmojiProps) {
  const translateY = useRef(new Animated.Value(height + 50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 20,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -20,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(rotate, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingEmoji,
        {
          left: startX,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

interface Props {
  onFinish: () => void;
}

export function WeirdSplash({ onFinish }: Props) {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const titleScale = useRef(new Animated.Value(0)).current;
  const titleRotate = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const glitchOffset = useRef(new Animated.Value(0)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;
  const [glitchText, setGlitchText] = useState('Oddly Enough');

  // Random emojis for floating
  const floatingEmojis = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      emoji: FLOATING_EMOJIS[i % FLOATING_EMOJIS.length],
      delay: i * 150,
      startX: (width / 12) * i,
    }))
  ).current;

  useEffect(() => {
    // Background pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(bgPulse, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Title animation - bounce in with rotation
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(titleRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Glitch effect
    const glitchInterval = setInterval(() => {
      const glitched = 'Oddly Enough'
        .split('')
        .map((c) => (Math.random() > 0.8 ? String.fromCharCode(c.charCodeAt(0) + Math.floor(Math.random() * 5)) : c))
        .join('');
      setGlitchText(glitched);
      
      Animated.sequence([
        Animated.timing(glitchOffset, {
          toValue: Math.random() * 6 - 3,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchOffset, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => setGlitchText('Oddly Enough'), 100);
    }, 800);

    // Subtitle fade in
    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 800,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Finish after 4.5 seconds (longer so bugs can run)
    const finishTimeout = setTimeout(onFinish, 4500);

    return () => {
      clearInterval(glitchInterval);
      clearTimeout(finishTimeout);
    };
  }, []);

  const spin = titleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  const bgColor = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: isDarkMode ? ['#0a0a0a', '#151515'] : ['#FAFAFA', '#F0F0F0'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>

      {/* Glitch layer (behind) */}
      <Animated.Text
        style={[
          styles.title,
          styles.glitchRed,
          {
            transform: [{ scale: titleScale }, { rotate: spin }, { translateX: glitchOffset }],
          },
        ]}
      >
        {glitchText}
      </Animated.Text>

      {/* Glitch layer (cyan) */}
      <Animated.Text
        style={[
          styles.title,
          styles.glitchCyan,
          {
            transform: [
              { scale: titleScale },
              { rotate: spin },
              { translateX: Animated.multiply(glitchOffset, -1) },
            ],
          },
        ]}
      >
        {glitchText}
      </Animated.Text>

      {/* Main title */}
      <Animated.Text
        style={[
          styles.title,
          {
            color: theme.text,
            transform: [{ scale: titleScale }, { rotate: spin }],
          },
        ]}
      >
        {glitchText}
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity, color: theme.textMuted }]}>
        🛸 News from the weird side 👽
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    textShadowColor: '#FF6B6B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  glitchRed: {
    color: '#ff0000',
    opacity: 0.7,
  },
  glitchCyan: {
    color: '#00ffff',
    opacity: 0.7,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 100,
    letterSpacing: 2,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 30,
  },
  cornerTL: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  cornerTR: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 60,
    left: 20,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 60,
    right: 20,
  },
  cornerEmoji: {
    fontSize: 28,
    opacity: 0.5,
  },
});
