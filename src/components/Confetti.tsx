import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 50;
const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

interface ConfettiPieceProps {
  delay: number;
  color: string;
  left: number;
}

function ConfettiPiece({ delay, color, left }: ConfettiPieceProps) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const swayDirection = Math.random() > 0.5 ? 1 : -1;
    const swayAmount = 30 + Math.random() * 50;
    
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height + 50,
          duration: 2500 + Math.random() * 1500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: swayDirection * swayAmount,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -swayDirection * swayAmount,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: swayDirection * swayAmount * 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotate, {
          toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(2000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const size = 8 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left,
          width: size,
          height: isCircle ? size : size * 1.5,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: spin },
          ],
        },
      ]}
    />
  );
}

interface Props {
  show: boolean;
}

export function Confetti({ show }: Props) {
  if (!show) return null;

  const pieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    delay: Math.random() * 500,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    left: Math.random() * width,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          color={piece.color}
          left={piece.left}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: -20,
  },
});
