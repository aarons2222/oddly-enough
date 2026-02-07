import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../context/AppContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_HEIGHT = SCREEN_HEIGHT * 0.75;
const ITEM_SIZE = 44;
const FALL_DURATION_START = 3000; // ms to fall from top to bottom
const FALL_DURATION_MIN = 1200;
const SPAWN_INTERVAL_START = 1200;
const SPAWN_INTERVAL_MIN = 400;
const LIVES_START = 3;
const HIGH_SCORE_KEY = 'oddity_catcher_high';

// Weird things to catch = good
const WEIRD_ITEMS = ['🛸', '👽', '🦑', '🎩', '👁️', '🔮', '🦇', '🌮', '🧿', '🪼', '🐙', '👾', '🍄', '🦄', '🪿', '🫠'];
// Boring things to avoid = bad
const BORING_ITEMS = ['📎', '📊', '👔', '📋', '🧮', '💼', '🏢', '📁'];

interface FallingItem {
  id: number;
  emoji: string;
  isWeird: boolean;
  x: number;
  animY: Animated.Value;
  caught: boolean;
  opacity: Animated.Value;
}

interface Props {
  theme: Theme;
  onClose: () => void;
}

export function OddityCatcher({ theme, onClose }: Props) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [highScore, setHighScore] = useState(0);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [combo, setCombo] = useState('');
  const [comboOpacity] = useState(new Animated.Value(0));

  const nextId = useRef(0);
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const livesRef = useRef(LIVES_START);
  const gameStateRef = useRef<'ready' | 'playing' | 'over'>('ready');
  const itemsRef = useRef<FallingItem[]>([]);
  const titleBounce = useRef(new Animated.Value(0)).current;

  // Load high score
  useEffect(() => {
    AsyncStorage.getItem(HIGH_SCORE_KEY).then(val => {
      if (val) setHighScore(parseInt(val, 10));
    });
  }, []);

  // Title bounce animation
  useEffect(() => {
    if (gameState === 'ready' || gameState === 'over') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(titleBounce, { toValue: -8, duration: 600, useNativeDriver: true }),
          Animated.timing(titleBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [gameState]);

  const showCombo = useCallback((text: string) => {
    setCombo(text);
    comboOpacity.setValue(1);
    Animated.timing(comboOpacity, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [comboOpacity]);

  const spawnItem = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const isWeird = Math.random() > 0.25; // 75% weird, 25% boring
    const emoji = isWeird
      ? WEIRD_ITEMS[Math.floor(Math.random() * WEIRD_ITEMS.length)]
      : BORING_ITEMS[Math.floor(Math.random() * BORING_ITEMS.length)];

    const x = Math.random() * (SCREEN_WIDTH - ITEM_SIZE - 20) + 10;
    const animY = new Animated.Value(-ITEM_SIZE);
    const opacity = new Animated.Value(1);
    const id = nextId.current++;

    const item: FallingItem = { id, emoji, isWeird, x, animY, caught: false, opacity };

    itemsRef.current = [...itemsRef.current, item];
    setItems([...itemsRef.current]);

    // Speed scales with score
    const progress = Math.min(scoreRef.current / 100, 1);
    const fallDuration = FALL_DURATION_START - (FALL_DURATION_START - FALL_DURATION_MIN) * progress;

    Animated.timing(animY, {
      toValue: GAME_HEIGHT,
      duration: fallDuration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      // Item reached bottom without being tapped
      if (!item.caught && gameStateRef.current === 'playing') {
        if (item.isWeird) {
          // Missed a weird item — lose streak but not a life
          streakRef.current = 0;
          setStreak(0);
        }
      }
      // Clean up
      itemsRef.current = itemsRef.current.filter(i => i.id !== id);
      setItems([...itemsRef.current]);
    });

    // Schedule next spawn
    const spawnInterval = SPAWN_INTERVAL_START - (SPAWN_INTERVAL_START - SPAWN_INTERVAL_MIN) * progress;
    spawnTimer.current = setTimeout(spawnItem, spawnInterval + Math.random() * 300);
  }, []);

  const handleTap = useCallback((item: FallingItem) => {
    if (item.caught || gameStateRef.current !== 'playing') return;
    item.caught = true;

    // Pop animation
    Animated.timing(item.opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    if (item.isWeird) {
      // Caught a weird thing — good!
      streakRef.current += 1;
      setStreak(streakRef.current);

      const multiplier = Math.floor(streakRef.current / 5) + 1;
      const points = 10 * multiplier;
      scoreRef.current += points;
      setScore(scoreRef.current);

      if (streakRef.current === 5) showCombo('🔥 x2 COMBO!');
      else if (streakRef.current === 10) showCombo('⚡ x3 MEGA!');
      else if (streakRef.current === 20) showCombo('💀 x5 GODLIKE!');
      else if (streakRef.current === 15) showCombo('🌀 x4 INSANE!');
    } else {
      // Tapped a boring thing — bad!
      streakRef.current = 0;
      setStreak(0);
      livesRef.current -= 1;
      setLives(livesRef.current);
      showCombo('💼 BORING! -1 ❤️');

      if (livesRef.current <= 0) {
        endGame();
      }
    }
  }, [showCombo]);

  const endGame = useCallback(async () => {
    gameStateRef.current = 'over';
    setGameState('over');
    if (spawnTimer.current) clearTimeout(spawnTimer.current);

    // Stop all animations
    itemsRef.current.forEach(item => {
      item.animY.stopAnimation();
    });

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      await AsyncStorage.setItem(HIGH_SCORE_KEY, scoreRef.current.toString());
    }
  }, [highScore]);

  const startGame = useCallback(() => {
    // Reset state
    scoreRef.current = 0;
    streakRef.current = 0;
    livesRef.current = LIVES_START;
    itemsRef.current = [];
    nextId.current = 0;

    setScore(0);
    setStreak(0);
    setLives(LIVES_START);
    setItems([]);
    setGameState('playing');
    gameStateRef.current = 'playing';

    // Start spawning after short delay
    setTimeout(spawnItem, 500);
  }, [spawnItem]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      gameStateRef.current = 'over';
    };
  }, []);

  const renderLives = () => {
    return '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, LIVES_START - lives));
  };

  if (gameState === 'ready') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ translateY: titleBounce }] }}>
          <Text style={styles.title}>🛸 ODDITY{'\n'}CATCHER 👽</Text>
        </Animated.View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Catch the weird stuff!{'\n'}Avoid the boring stuff!
        </Text>
        <View style={styles.tutorialRow}>
          <View style={styles.tutorialItem}>
            <Text style={styles.tutorialEmoji}>🦑 🔮 👽</Text>
            <Text style={[styles.tutorialLabel, { color: '#4CAF50' }]}>TAP = +Points</Text>
          </View>
          <View style={styles.tutorialItem}>
            <Text style={styles.tutorialEmoji}>📎 💼 👔</Text>
            <Text style={[styles.tutorialLabel, { color: '#FF5252' }]}>TAP = -Life</Text>
          </View>
        </View>
        <Text style={[styles.streakHint, { color: theme.textMuted }]}>
          🔥 Build streaks for multipliers!
        </Text>
        {highScore > 0 && (
          <Text style={[styles.highScore, { color: theme.accent }]}>
            Best: {highScore}
          </Text>
        )}
        <TouchableOpacity style={styles.playBtn} onPress={startGame} activeOpacity={0.8}>
          <Text style={styles.playBtnText}>▶ PLAY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === 'over') {
    const isNewHigh = scoreRef.current >= highScore && scoreRef.current > 0;
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ translateY: titleBounce }] }}>
          <Text style={styles.title}>
            {isNewHigh ? '🏆 NEW HIGH!' : '💀 GAME OVER'}
          </Text>
        </Animated.View>
        <Text style={styles.finalScore}>{score}</Text>
        <Text style={[styles.finalLabel, { color: theme.textSecondary }]}>points</Text>
        {isNewHigh && (
          <Text style={styles.newHighText}>🎉 You beat your record!</Text>
        )}
        {!isNewHigh && highScore > 0 && (
          <Text style={[styles.highScore, { color: theme.textMuted }]}>
            Best: {highScore}
          </Text>
        )}
        <TouchableOpacity style={styles.playBtn} onPress={startGame} activeOpacity={0.8}>
          <Text style={styles.playBtnText}>↻ AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quitBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={[styles.quitBtnText, { color: theme.textMuted }]}>Back to news</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Playing state
  return (
    <View style={[styles.gameContainer, { backgroundColor: theme.background }]}>
      {/* HUD */}
      <View style={[styles.hud, { backgroundColor: theme.card }]}>
        <Text style={styles.hudLives}>{renderLives()}</Text>
        <View style={styles.hudCenter}>
          <Text style={[styles.hudScore, { color: theme.text }]}>{score}</Text>
          {streak >= 3 && (
            <Text style={styles.hudStreak}>🔥{streak}</Text>
          )}
        </View>
        <TouchableOpacity onPress={endGame} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.hudPause}>⏸</Text>
        </TouchableOpacity>
      </View>

      {/* Game area */}
      <View style={styles.gameArea}>
        {items.map(item => (
          <Animated.View
            key={item.id}
            style={[
              styles.fallingItem,
              {
                left: item.x,
                transform: [{ translateY: item.animY }],
                opacity: item.opacity,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleTap(item)}
              activeOpacity={0.6}
              style={styles.itemTouchable}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Combo text */}
        {combo ? (
          <Animated.View style={[styles.comboContainer, { opacity: comboOpacity }]}>
            <Text style={styles.comboText}>{combo}</Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#888',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FF6B6B',
    marginBottom: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  tutorialRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  tutorialItem: {
    alignItems: 'center',
  },
  tutorialEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  tutorialLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  streakHint: {
    fontSize: 14,
    marginBottom: 20,
  },
  highScore: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  playBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 8,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  quitBtn: {
    marginTop: 20,
    padding: 12,
  },
  quitBtnText: {
    fontSize: 16,
  },
  finalScore: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  finalLabel: {
    fontSize: 18,
    marginBottom: 16,
  },
  newHighText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 24,
  },
  // Game state
  gameContainer: {
    flex: 1,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
  },
  hudLives: {
    fontSize: 20,
  },
  hudCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudScore: {
    fontSize: 28,
    fontWeight: '900',
  },
  hudStreak: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  hudPause: {
    fontSize: 24,
  },
  gameArea: {
    flex: 1,
    overflow: 'hidden',
  },
  fallingItem: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  itemTouchable: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 36,
  },
  comboContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
