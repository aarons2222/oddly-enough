import React, { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Easing, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const BUG_EMOJIS = ['🐛', '🐜', '🪲', '🪳', '🦗', '🕷️', '🕷️', '🐜', '🐜', '🐜'];

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
  
  const isSpider = bug.emoji === '🕷️';
  const isAnt = bug.emoji === '🐜';

  useEffect(() => {
    // Pop in
    Animated.timing(scale, {
      toValue: isSpider ? 1.3 : 1, // Spiders are bigger
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Different wiggle speeds
    const wiggleDuration = isAnt ? 30 : isSpider ? 80 : 50;
    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, {
          toValue: 1,
          duration: wiggleDuration,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: -1,
          duration: wiggleDuration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Different movement patterns
    if (isSpider) {
      // Spiders: stop-start creepy movement
      const midX = (bug.startX + bug.endX) / 2 + (Math.random() - 0.5) * 100;
      const midY = (bug.startY + bug.endY) / 2 + (Math.random() - 0.5) * 100;
      
      Animated.sequence([
        Animated.timing(position, {
          toValue: { x: midX, y: midY },
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(500 + Math.random() * 1000), // Creepy pause
        Animated.timing(position, {
          toValue: { x: bug.endX, y: bug.endY },
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(scale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(onComplete);
      });
    } else {
      // Ants are fast, others are medium
      const duration = isAnt ? 1200 + Math.random() * 800 : 2000 + Math.random() * 1500;
      
      Animated.timing(position, {
        toValue: { x: bug.endX, y: bug.endY },
        duration,
        easing: isAnt ? Easing.linear : Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(scale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(onComplete);
      });
    }
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

interface ScreenBugsProps {
  chaosMode?: boolean;
}

export function ScreenBugs({ chaosMode = false }: ScreenBugsProps) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const bugIdRef = useRef(0);
  const bugCountRef = useRef(0); // Track active bugs

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

    // Settings based on mode
    const initialDelay = chaosMode ? 1000 : 20000 + Math.random() * 10000; // Normal: 20-30s first bug
    const spawnInterval = chaosMode ? 2000 + Math.random() * 2000 : 20000 + Math.random() * 10000; // Normal: 20-30s between
    const spawnChance = chaosMode ? 0.9 : 1.0; // Normal: always spawn (but limited to 1)
    const maxBugs = chaosMode ? 10 : 1; // Normal: only 1 bug at a time!
    
    const trySpawnBug = () => {
      if (bugCountRef.current >= maxBugs) return;
      if (Math.random() > spawnChance && bugCountRef.current > 0) return; // Skip if chance fails (always spawn first)
      
      bugCountRef.current++;
      spawnBug();
    };
    
    const initialTimeout = setTimeout(() => {
      trySpawnBug();
      if (chaosMode) trySpawnBug();
      
      const interval = setInterval(() => {
        trySpawnBug();
        if (chaosMode && Math.random() > 0.5) trySpawnBug();
      }, spawnInterval);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      bugCountRef.current = 0;
    };
  }, [chaosMode]);

  const removeBug = (id: number) => {
    bugCountRef.current = Math.max(0, bugCountRef.current - 1);
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
