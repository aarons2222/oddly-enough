import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformIcon } from '../components/PlatformIcon';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

interface Props {
  onBack: () => void;
}

// Floating background emoji
function FloatingEmoji({ emoji, delay, startX, startY }: { emoji: string; delay: number; startX: number; startY: number }) {
  const float = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 0.15, duration: 500, delay, useNativeDriver: true }).start();
    
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -20, duration: 2500 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2500 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    
    const driftAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 10, duration: 3000 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: -10, duration: 3000 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    
    floatAnim.start();
    driftAnim.start();
    
    return () => { floatAnim.stop(); driftAnim.stop(); };
  }, []);

  return (
    <Animated.Text 
      style={[
        styles.floatingEmoji, 
        { left: startX, top: startY, opacity, transform: [{ translateY: float }, { translateX: drift }] }
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// Animated card wrapper
function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      {children}
    </Animated.View>
  );
}

export function SettingsScreen({ onBack }: Props) {
  const { isDarkMode, toggleDarkMode, darkModePreference, setDarkModePreference, fontSize, setFontSize, chaosMode, setChaosMode, bugsEnabled, setBugsEnabled } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const titleWobble = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(titleWobble, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(titleWobble, { toValue: -1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    
    wobble.start();
    glow.start();
    
    return () => { wobble.stop(); glow.stop(); };
  }, []);

  const titleRotate = titleWobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-4deg', '0deg', '4deg'] });
  const titleScale = titleWobble.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.98, 1, 0.98] });

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Floating background emojis */}
      {bgEmojis.map((e, i) => (
        <FloatingEmoji key={i} emoji={e.emoji} startX={e.x} startY={e.y} delay={i * 100} />
      ))}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.placeholder} />
        
        <Animated.View style={[styles.logoContainer, { transform: [{ rotate: titleRotate }, { scale: titleScale }] }]}>
          <Text style={[styles.logo, { color: theme.text }]}>Weird</Text>
          <Text style={styles.logoAccent}>Settings</Text>
        </Animated.View>
        
        <TouchableOpacity onPress={onBack} style={styles.closeButton} activeOpacity={0.8}>
          <PlatformIcon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {/* Appearance Card */}
          <AnimatedCard index={0}>
            <View style={[styles.card, styles.cardColumn, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff', borderColor: isDarkMode ? '#2a2a4e' : '#e0e0ff' }]}>
              <View style={styles.cardRow}>
                <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#2a2a4e' : '#f0f0ff' }]}>
                  <Text style={styles.cardEmoji}>{darkModePreference === 'dark' ? '🌙' : darkModePreference === 'auto' ? '🔄' : '☀️'}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                    Appearance
                  </Text>
                  <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                    Choose your vibe
                  </Text>
                </View>
              </View>
              <View style={styles.optionRow}>
                {([
                  { key: 'light' as const, label: 'Light ☀️' },
                  { key: 'dark' as const, label: 'Dark 🌙' },
                  { key: 'auto' as const, label: 'Auto 🔄' },
                ]).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionButton,
                      { backgroundColor: darkModePreference === opt.key ? '#FF6B6B' : (isDarkMode ? '#2a2a4e' : '#f0f0ff') },
                    ]}
                    onPress={() => setDarkModePreference(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, { color: darkModePreference === opt.key ? '#fff' : (isDarkMode ? '#ccc' : '#444') }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedCard>

          {/* Font Size Card */}
          <AnimatedCard index={1}>
            <View style={[styles.card, styles.cardColumn, { backgroundColor: isDarkMode ? '#1a2a2e' : '#fff', borderColor: isDarkMode ? '#2a4a4e' : '#e0f0ff' }]}>
              <View style={styles.cardRow}>
                <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#2a4a4e' : '#f0f8ff' }]}>
                  <Text style={styles.cardEmoji}>🔤</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                    Reading Size
                  </Text>
                  <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                    Text size when reading articles
                  </Text>
                </View>
              </View>
              <View style={styles.optionRow}>
                {([
                  { key: 'small' as const, label: 'Aa', sub: 'Small', size: 13 },
                  { key: 'medium' as const, label: 'Aa', sub: 'Medium', size: 16 },
                  { key: 'large' as const, label: 'Aa', sub: 'Large', size: 20 },
                ]).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionButton,
                      { backgroundColor: fontSize === opt.key ? '#FF6B6B' : (isDarkMode ? '#2a4a4e' : '#f0f8ff') },
                    ]}
                    onPress={() => setFontSize(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionLabel, { fontSize: opt.size, color: fontSize === opt.key ? '#fff' : (isDarkMode ? '#ccc' : '#444') }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.optionSub, { color: fontSize === opt.key ? 'rgba(255,255,255,0.8)' : (isDarkMode ? '#888' : '#888') }]}>
                      {opt.sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedCard>

          {/* Bugs Card */}
          <AnimatedCard index={2}>
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
          <AnimatedCard index={3}>
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
          <AnimatedCard index={4}>
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

          {/* Share App Card */}
          <AnimatedCard index={5}>
            <TouchableOpacity 
              style={[styles.card, styles.actionCard, { backgroundColor: isDarkMode ? '#1a1a2e' : '#f0f0ff', borderColor: '#6366F1' }]}
              onPress={() => {
                const storeUrl = Platform.OS === 'ios'
                  ? 'https://apps.apple.com/app/id6758560461'
                  : Platform.OS === 'android'
                    ? 'https://play.google.com/store/apps/details?id=com.oddlyenough.app'
                    : 'https://oddlyenough.app';
                Linking.openURL(storeUrl);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIconBg, { backgroundColor: isDarkMode ? '#2a2a4e' : '#e0e0ff' }]}>
                <Text style={styles.cardEmoji}>📲</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
                  Share the Weirdness
                </Text>
                <Text style={[styles.cardDesc, { color: isDarkMode ? '#888' : '#666' }]}>
                  Tell your friends about Oddly Enough
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </AnimatedCard>

          {/* Leave a Review Card - iOS/Android only */}
          {Platform.OS !== 'web' && (
            <AnimatedCard index={6}>
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
          🛸 Oddly Enough v1.1.0
        </Text>
        <Text style={[styles.footerSubtext, { color: isDarkMode ? '#333' : '#bbb' }]}>
          Made with 👽 in a parallel dimension
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardsContainer: {
    gap: 12,
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  cardColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionLabel: {
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 10,
    marginTop: 2,
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
