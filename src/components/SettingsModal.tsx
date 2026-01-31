import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Floating emoji decoration
function FloatingEmoji({ emoji, delay, x, y }: { emoji: string; delay: number; x: number; y: number }) {
  const float = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -15, duration: 2000 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 4000 + delay * 2, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.Text style={[styles.floatingEmoji, { left: x, top: y, transform: [{ translateY: float }, { rotate: spin }] }]}>
      {emoji}
    </Animated.Text>
  );
}

export function SettingsModal({ visible, onClose }: Props) {
  const { isDarkMode, toggleDarkMode, chaosMode, setChaosMode, bugsEnabled, setBugsEnabled } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const titleWobble = useRef(new Animated.Value(0)).current;
  const wobbleAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      
      // Title wobble - only start if not already running
      if (!wobbleAnimation.current) {
        wobbleAnimation.current = Animated.loop(
          Animated.sequence([
            Animated.timing(titleWobble, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(titleWobble, { toValue: -1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        );
        wobbleAnimation.current.start();
      }
    } else {
      slideAnim.setValue(height);
      bgOpacity.setValue(0);
      // Stop wobble when closing
      if (wobbleAnimation.current) {
        wobbleAnimation.current.stop();
        wobbleAnimation.current = null;
      }
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const titleRotate = titleWobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-3deg', '0deg', '3deg'] });

  const emojis = ['👽', '🛸', '🌀', '👁️', '🔮', '🎪', '🦑', '🌈'];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: bgOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: isDarkMode ? '#0a0a0f' : '#f0f0ff',
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Floating decorations */}
        {emojis.map((emoji, i) => (
          <FloatingEmoji 
            key={i} 
            emoji={emoji} 
            delay={i * 200} 
            x={20 + (i % 4) * (width - 80) / 3} 
            y={100 + Math.floor(i / 4) * 300 + (i % 3) * 50}
          />
        ))}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <View style={[styles.closeCircle, { backgroundColor: isDarkMode ? '#222' : '#ddd' }]}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
            </View>
          </TouchableOpacity>
          
          <Animated.Text style={[styles.title, { color: theme.text, transform: [{ rotate: titleRotate }] }]}>
            ⚙️ Weird Settings
          </Animated.Text>
        </View>

        {/* Settings Cards */}
        <View style={styles.cardsContainer}>
          {/* Dark Mode Card */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff', borderColor: isDarkMode ? '#333' : '#ddd' }]}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>{isDarkMode ? '🌙' : '☀️'}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                {isDarkMode ? 'Dark Side' : 'Light Side'}
              </Text>
              <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                {isDarkMode ? 'Embrace the darkness' : 'Let there be light'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#ccc', true: '#6366F1' }}
              thumbColor="#fff"
              ios_backgroundColor="#ccc"
            />
          </View>

          {/* Bugs Card */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1a2e1a' : '#fff', borderColor: isDarkMode ? '#333' : '#ddd' }]}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🐛</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                Creepy Crawlies
              </Text>
              <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                Bugs scurry across your screen
              </Text>
            </View>
            <Switch
              value={bugsEnabled}
              onValueChange={setBugsEnabled}
              trackColor={{ false: '#ccc', true: '#22C55E' }}
              thumbColor="#fff"
              ios_backgroundColor="#ccc"
            />
          </View>

          {/* Chaos Mode Card */}
          <View style={[styles.card, styles.chaosCard, { backgroundColor: isDarkMode ? '#2e1a2e' : '#fff8f0', borderColor: chaosMode ? '#9B59B6' : (isDarkMode ? '#333' : '#ddd') }]}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🌀</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                CHAOS MODE
              </Text>
              <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                Maximum weirdness unleashed
              </Text>
            </View>
            <Switch
              value={chaosMode}
              onValueChange={setChaosMode}
              trackColor={{ false: '#ccc', true: '#9B59B6' }}
              thumbColor="#fff"
              ios_backgroundColor="#ccc"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? '#444' : '#aaa' }]}>
            🛸 Oddly Enough v1.0 • Made with 👽
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  chaosCard: {
    borderWidth: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.15,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
