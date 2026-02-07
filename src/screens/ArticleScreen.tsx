import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
  Dimensions,
  ActivityIndicator,
  Animated,
  StatusBar as RNStatusBar,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlatformIcon } from '../components/PlatformIcon';
import { Article, CATEGORIES } from '../types/Article';
import { format } from 'date-fns';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';
import { getCachedContent, setCachedContent } from '../services/contentCache';
import { Confetti } from '../components/Confetti';
import { ShareSheet } from '../components/ShareSheet';
import { ScreenBugs } from '../components/ScreenBugs';

interface Props {
  article: Article;
  onBack: () => void;
}

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.55;

// API URL
const API_URL = 'https://oddly-enough-api.vercel.app';

export function ArticleScreen({ article, onBack }: Props) {
  const { isDarkMode, fontScale, bugsEnabled, chaosMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const categoryInfo = CATEGORIES.find(c => c.id === article.category);
  const insets = useSafeAreaInsets();
  
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Animation values
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.15)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const metaAnim = useRef(new Animated.Value(0)).current;
  
  // Swipe to dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollOffset = useRef(0);
  const isDragging = useRef(false);
  
  // Parallax & progress
  const scrollY = useRef(new Animated.Value(0)).current;
  const [readingProgress, setReadingProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if at top of scroll and swiping down
        return scrollOffset.current <= 0 && gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          // Dismiss
          Animated.timing(translateY, {
            toValue: height,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onBack());
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    // Run hero animation sequence
    Animated.sequence([
      // Image fade in and zoom
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Overlay fade
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Back button slide in
    Animated.timing(backButtonAnim, {
      toValue: 1,
      duration: 500,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Staggered content animations
    Animated.timing(categoryAnim, {
      toValue: 1,
      duration: 600,
      delay: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 600,
      delay: 650,
      useNativeDriver: true,
    }).start();

    Animated.timing(metaAnim, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchArticleContent();
  }, [article.url]);

  const fetchArticleContent = async () => {
    setLoading(true);
    
    // 1. Check cache first (instant!)
    const cached = await getCachedContent(article.url);
    if (cached) {
      setFullContent(cached);
      setLoading(false);
      return;
    }
    
    // 2. Fetch from API with 8s timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `${API_URL}/api/content?url=${encodeURIComponent(article.url)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          // Cache for next time
          await setCachedContent(article.url, data.content);
          setFullContent(data.content);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      // Content fetch failed or timed out, will show summary
    }
    
    // 3. Fallback to summary with "read more" prompt
    setFullContent(null);
    setLoading(false);
  };
  
  const handleShare = () => {
    setShowShareSheet(true);
  };

  const handleOpenSource = () => {
    Linking.openURL(article.url);
  };

  const formattedDate = format(article.publishedAt, 'MMMM d, yyyy');
  
  // Calculate reading time (average 200 words per minute)
  const wordCount = (fullContent || article.summary).split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Animation interpolations
  const backButtonTranslate = backButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 0],
  });

  const categoryTranslate = categoryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const titleTranslate = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const metaTranslate = metaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        scrollOffset.current = contentOffset.y;
        
        // Calculate reading progress
        const totalScrollable = contentSize.height - layoutMeasurement.height;
        if (totalScrollable > 0) {
          const progress = Math.min(1, Math.max(0, contentOffset.y / totalScrollable));
          setReadingProgress(progress);
          
          // Trigger confetti at 95%
          if (progress >= 0.95 && !showConfetti) {
            setShowConfetti(true);
          }
        }
      },
    }
  );

  // Parallax interpolation
  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, HERO_HEIGHT],
    outputRange: [-50, 0, HERO_HEIGHT * 0.4],
    extrapolate: 'clamp',
  });

  const imageScaleOnScroll = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.card,
          transform: [{ translateY }],
        }
      ]}
      {...panResponder.panHandlers}
    >
      {/* Reading Progress Bar */}
      <View style={[styles.progressContainer, { top: insets.top || 0 }]}>
        <View style={[styles.progressBar, { width: `${readingProgress * 100}%` }]} />
      </View>
      
      {/* Confetti on finish */}
      <Confetti show={showConfetti} />
      
      {/* Custom Share Sheet */}
      <ShareSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        title={article.title}
        url={`https://oddlyenough.news/article?url=${encodeURIComponent(article.url)}`}
        summary={article.summary}
        imageUrl={article.imageUrl || undefined}
        source={article.source}
      />
      
      {/* Screen Bugs */}
      {bugsEnabled && <ScreenBugs chaosMode={chaosMode} />}
      
      {/* Floating Back Button - Outside ScrollView */}
      <Animated.View 
        style={[
          styles.floatingBackButton,
          {
            top: Math.max(insets.top, 20) + 8,
            opacity: backButtonAnim,
            transform: [{ translateX: backButtonTranslate }],
          }
        ]}
      >
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.closeButtonCircle}
          activeOpacity={0.8}
        >
          <PlatformIcon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Share Button - Outside ScrollView */}
      <Animated.View 
        style={[
          styles.floatingShareButton,
          {
            top: Math.max(insets.top, 20) + 8,
            opacity: backButtonAnim,
            transform: [{ translateX: Animated.multiply(backButtonTranslate, -1) }],
          }
        ]}
      >
        <TouchableOpacity 
          onPress={handleShare} 
          style={styles.closeButtonCircle}
          activeOpacity={0.8}
        >
          <PlatformIcon name="share-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {/* Hero Image with Parallax */}
          {article.imageUrl && !article.imageUrl.includes('placeholder') && !article.imageUrl.includes('dummyimage') ? (
            <Animated.Image 
              source={{ uri: article.imageUrl }} 
              style={[
                styles.heroImage,
                {
                  opacity: imageOpacity,
                  transform: [
                    { scale: Animated.multiply(imageScale, imageScaleOnScroll) },
                    { translateY: imageTranslateY },
                  ],
                }
              ]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: '#FF6B6B' }]} />
          )}

          {/* Gradient Overlay */}
          <Animated.View 
            style={[
              styles.heroOverlay,
              { opacity: overlayOpacity }
            ]} 
          />

          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Category Badge */}
            <Animated.View 
              style={[
                styles.categoryBadge,
                {
                  opacity: categoryAnim,
                  transform: [{ translateY: categoryTranslate }],
                }
              ]}
            >
              <Text style={styles.categoryEmoji}>{categoryInfo?.emoji}</Text>
              <Text style={styles.categoryText}>{categoryInfo?.label}</Text>
            </Animated.View>

            {/* Title */}
            <Animated.Text 
              style={[
                styles.heroTitle,
                {
                  opacity: titleAnim,
                  transform: [{ translateY: titleTranslate }],
                }
              ]}
            >
              {article.title}
            </Animated.Text>

            {/* Meta */}
            <Animated.View 
              style={[
                styles.heroMeta,
                {
                  opacity: metaAnim,
                  transform: [{ translateY: metaTranslate }],
                }
              ]}
            >
              <Text style={styles.heroSource}>{article.source}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.heroDate}>{formattedDate}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.heroReadTime}>{readingTime} min read</Text>
            </Animated.View>
          </View>
        </View>

        {/* Article Body */}
        <View style={[styles.articleBody, { backgroundColor: theme.card }]}>
          {/* Lead/Summary - only show if we have full content (avoids duplicate) */}
          {fullContent && fullContent !== article.summary ? (
            <>
              <Text style={[styles.lead, { color: theme.textSecondary, fontSize: 18 * fontScale }]}>{article.summary}</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </>
          ) : null}

          {/* Content */}
          <View style={styles.body}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.accent} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading full article...</Text>
              </View>
            ) : (
              (fullContent || article.summary).split('\n\n').map((paragraph, index) => (
                <Text key={index} style={[styles.paragraph, { color: theme.text, fontSize: 17 * fontScale, lineHeight: 28 * fontScale }]}>
                  {paragraph}
                </Text>
              ))
            )}
          </View>

          {/* Source attribution */}
          <TouchableOpacity 
            style={[styles.sourceLink, { borderColor: theme.border }]} 
            onPress={handleOpenSource}
            activeOpacity={0.7}
          >
            <Text style={[styles.sourceLinkText, { color: theme.textSecondary }]}>
              Source: <Text style={styles.sourceName}>{article.source}</Text>
            </Text>
            <PlatformIcon name="open-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Footer Spacing */}
          <View style={styles.footer} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Hero Styles
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: '#1a1a1a',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // Gradient simulation using multiple overlays
    ...(Platform.OS === 'web' ? {
      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.2) 100%)',
    } : {}),
  },
  
  // Floating Back Button
  floatingBackButton: {
    position: 'absolute',
    left: 20,
    zIndex: 100,
  },
  // Floating Share Button
  floatingShareButton: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    } : {}),
  },
  
  // Hero Content
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 5,
  },
  categoryText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 34,
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSource: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 10,
  },
  heroDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  heroReadTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Article Body
  articleBody: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 28,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  lead: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  body: {
    flex: 1,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  readMoreContainer: {
    paddingVertical: 10,
  },
  readMoreText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  sourceLinkText: {
    fontSize: 15,
  },
  sourceName: {
    fontWeight: '700',
    color: '#FF6B6B',
  },
  footer: {
    height: 40,
  },
});
