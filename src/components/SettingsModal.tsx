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
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { PlatformIcon } from './PlatformIcon';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Floating background emoji
function FloatingEmoji({ emoji, delay, startX, startY }: { emoji: string; delay: number; startX: number; startY: number }) {
  const float = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, { toValue: 0.15, duration: 500, delay, useNativeDriver: true }).start();
    
    // Float up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -20, duration: 2500 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2500 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    
    // Drift side to side
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 10, duration: 3000 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: -10, duration: 3000 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text 
      style={[
        styles.floatingEmoji, 
        { 
          left: startX, 
          top: startY, 
          opacity,
          transform: [{ translateY: float }, { translateX: drift }] 
        }
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// Animated card wrapper
function AnimatedCard({ children, index, visible }: { children: React.ReactNode; index: number; visible: boolean }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 80,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(50);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      {children}
    </Animated.View>
  );
}

export function SettingsModal({ visible, onClose }: Props) {
  const { isDarkMode, toggleDarkMode, chaosMode, setChaosMode, bugsEnabled, setBugsEnabled } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const titleWobble = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      // Title wobble
      Animated.loop(
        Animated.sequence([
          Animated.timing(titleWobble, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(titleWobble, { toValue: -1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
      
      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      bgOpacity.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const titleRotate = titleWobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-4deg', '0deg', '4deg'] });
  const titleScale = titleWobble.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.98, 1, 0.98] });

  // Background emojis
  const bgEmojis = [
    { emoji: '👽', x: width * 0.1, y: height * 0.15 },
    { emoji: '🛸', x: width * 0.8, y: height * 0.1 },
    { emoji: '🌀', x: width * 0.15, y: height * 0.4 },
    { emoji: '👁️', x: width * 0.85, y: height * 0.35 },
    { emoji: '🔮', x: width * 0.1, y: height * 0.65 },
    { emoji: '🦑', x: width * 0.8, y: height * 0.6 },
    { emoji: '🌈', x: width * 0.2, y: height * 0.85 },
    { emoji: '🎪', x: width * 0.75, y: height * 0.8 },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: bgOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.background,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 20,
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          }
        ]}
      >
        {/* Floating background emojis */}
        {bgEmojis.map((e, i) => (
          <FloatingEmoji key={i} emoji={e.emoji} startX={e.x} startY={e.y} delay={i * 100} />
        ))}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          
          <Animated.View style={[styles.logoContainer, { transform: [{ rotate: titleRotate }, { scale: titleScale }] }]}>
            <Text style={[styles.logo, { color: theme.text }]}>Weird</Text>
            <Text style={styles.logoAccent}>Settings</Text>
            <Text style={styles.sparkle}>✨</Text>
          </Animated.View>
          
          <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.8}>
            <PlatformIcon name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Settings Cards */}
          <View style={styles.cardsContainer}>
            {/* Dark Mode Card */}
            <AnimatedCard index={0} visible={visible}>
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff', borderColor: isDarkMode ? '#2a2a4e' : '#e0e0ff' }]}>
                <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#2a2a4e' : '#f0f0ff' }]}>
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
            </AnimatedCard>

            {/* Bugs Card */}
            <AnimatedCard index={1} visible={visible}>
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#1a2e1a' : '#fff', borderColor: isDarkMode ? '#2a4e2a' : '#e0ffe0' }]}>
                <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#2a4e2a' : '#f0fff0' }]}>
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
            </AnimatedCard>

            {/* Chaos Mode Card */}
            <AnimatedCard index={2} visible={visible}>
              <Animated.View 
                style={[
                  styles.card, 
                  styles.chaosCard, 
                  { 
                    backgroundColor: isDarkMode ? '#2e1a2e' : '#fff8f0', 
                    borderColor: chaosMode ? '#9B59B6' : (isDarkMode ? '#4e2a4e' : '#ffe0f0'),
                    shadowOpacity: chaosMode ? glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }) : 0,
                  }
                ]}
              >
                <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#4e2a4e' : '#fff0f8' }]}>
                  <Text style={styles.cardEmoji}>🌀</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: chaosMode ? '#9B59B6' : (isDarkMode ? '#fff' : '#222') }]}>
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
              </Animated.View>
            </AnimatedCard>

            {/* Feed the News Goblins Card */}
            <AnimatedCard index={3} visible={visible}>
              <TouchableOpacity 
                style={[styles.card, styles.actionCard, { backgroundColor: isDarkMode ? '#1a2a1a' : '#f0fff0', borderColor: '#4CAF50' }]}
                onPress={() => Linking.openURL('https://buymeacoffee.com/oddlyenough')}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#2a4a2a' : '#e0ffe0' }]}>
                  <Text style={styles.cardEmoji}>☕</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                    Feed the News Goblins
                  </Text>
                  <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                    Buy us a coffee ☕
                  </Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            </AnimatedCard>

            {/* Leave a Review Card - iOS/Android only */}
            {Platform.OS !== 'web' && (
              <AnimatedCard index={4} visible={visible}>
                <TouchableOpacity 
                  style={[styles.card, styles.actionCard, { backgroundColor: isDarkMode ? '#2a2a1a' : '#fffef0', borderColor: '#FFD700' }]}
                  onPress={() => {
                    const storeUrl = Platform.OS === 'ios'
                      ? 'https://apps.apple.com/app/id6758560461?action=write-review'
                      : 'market://details?id=com.oddlyenough.app';
                    Linking.openURL(storeUrl);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#4a4a2a' : '#fff8e0' }]}>
                    <Text style={styles.cardEmoji}>⭐</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                      Leave a Review
                    </Text>
                    <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                      Help others discover the weird
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>
              </AnimatedCard>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? '#444' : '#aaa' }]}>
            🛸 Oddly Enough v1.0.3
          </Text>
          <Text style={[styles.footerSubtext, { color: isDarkMode ? '#333' : '#bbb' }]}>
            Made with 👽 in a parallel dimension
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
  },
  logoAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FF6B6B',
    marginLeft: 6,
  },
  sparkle: {
    fontSize: 20,
    marginLeft: 4,
  },
  placeholder: {
    width: 40,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  chaosCard: {
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 5,
  },
  actionCard: {
    borderStyle: 'dashed',
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 20,
    color: '#888',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 20,
    position: 'relative',
  },
  dividerText: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 32,
    zIndex: -1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 11,
    marginTop: 4,
  },
});
