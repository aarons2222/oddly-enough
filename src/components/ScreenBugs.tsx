import React, { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Easing, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const BUG_EMOJIS = ['🐛', '🐜', '🪲', '🪳', '🦗'];

interface Bug {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function SingleBug({ bug, onComplete }: { bug: Bug; onComplete: () => void }) {
  const position = useRef(new Animated.ValueXY({ x: bug.startX, y: bug.startY })).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop in
    Animated.timing(scale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Wiggle while moving
    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scurry across with slight randomness
    const duration = 2000 + Math.random() * 1500;
    
    Animated.timing(position, {
      toValue: { x: bug.endX, y: bug.endY },
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Pop out
      Animated.timing(scale, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(onComplete);
    });
  }, []);

  const rotate = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  // Calculate rotation to face direction of travel
  const angle = Math.atan2(bug.endY - bug.startY, bug.endX - bug.startX) * (180 / Math.PI);
  const baseRotate = `${angle + 90}deg`;

  return (
    <Animated.Text
      style={[
        styles.bug,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: baseRotate },
            { rotate },
            { scale },
          ],
        },
      ]}
    >
      {bug.emoji}
    </Animated.Text>
  );
}

export function ScreenBugs() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const bugIdRef = useRef(0);

  useEffect(() => {
    const spawnBug = () => {
      const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      let startX, startY, endX, endY;

      switch (edge) {
        case 0: // From top
          startX = Math.random() * width;
          startY = -30;
          endX = Math.random() * width;
          endY = height + 30;
          break;
        case 1: // From right
          startX = width + 30;
          startY = Math.random() * height;
          endX = -30;
          endY = Math.random() * height;
          break;
        case 2: // From bottom
          startX = Math.random() * width;
          startY = height + 30;
          endX = Math.random() * width;
          endY = -30;
          break;
        default: // From left
          startX = -30;
          startY = Math.random() * height;
          endX = width + 30;
          endY = Math.random() * height;
      }

      const newBug: Bug = {
        id: bugIdRef.current++,
        emoji: BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)],
        startX,
        startY,
        endX,
        endY,
      };

      setBugs(prev => [...prev, newBug]);
    };

    // Initial delay before first bug
    const initialTimeout = setTimeout(() => {
      spawnBug();
      
      // Then spawn periodically
      const interval = setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance each interval
          spawnBug();
        }
      }, 8000 + Math.random() * 7000); // Every 8-15 seconds

      return () => clearInterval(interval);
    }, 5000 + Math.random() * 5000); // First bug after 5-10 seconds

    return () => clearTimeout(initialTimeout);
  }, []);

  const removeBug = (id: number) => {
    setBugs(prev => prev.filter(b => b.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {bugs.map(bug => (
        <SingleBug
          key={bug.id}
          bug={bug}
          onComplete={() => removeBug(bug.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  bug: {
    position: 'absolute',
    fontSize: 24,
  },
});
