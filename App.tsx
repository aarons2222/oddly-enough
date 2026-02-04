import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { FeedScreen } from './src/screens/FeedScreen';
import { ArticleScreen } from './src/screens/ArticleScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WeirdSplash } from './src/components/WeirdSplash';
import { AppProvider, useApp, lightTheme, darkTheme } from './src/context/AppContext';
import { Article } from './src/types/Article';

// Keep splash screen visible while loading fonts (only on native)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

type Screen = 'feed' | 'article' | 'bookmarks' | 'settings';

const { width, height } = Dimensions.get('window');

function AppContent() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('feed');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const articleScale = useRef(new Animated.Value(0.85)).current;
  const articleOpacity = useRef(new Animated.Value(0)).current;
  const articleSlide = useRef(new Animated.Value(50)).current;
  const bookmarksScale = useRef(new Animated.Value(0)).current;
  const settingsScale = useRef(new Animated.Value(0)).current;

  const navigateToArticle = (article: Article) => {
    setSelectedArticle(article);
    setPreviousScreen(currentScreen);
    setCurrentScreen('article');
    
    // Hero animation - scale up + slide up + fade in
    articleScale.setValue(0.9);
    articleOpacity.setValue(0);
    articleSlide.setValue(60);
    
    Animated.parallel([
      Animated.spring(articleScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(articleOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(articleSlide, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const navigateBack = () => {
    // Hero close - scale down + slide down + fade out
    Animated.parallel([
      Animated.timing(articleScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(articleOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(articleSlide, {
        toValue: 60,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(previousScreen);
      setSelectedArticle(null);
    });
  };

  const navigateToBookmarks = () => {
    setPreviousScreen('feed');
    setCurrentScreen('bookmarks');
    
    // Scale/morph from button position (top-left area)
    bookmarksScale.setValue(0);
    Animated.spring(bookmarksScale, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const navigateToFeed = () => {
    // Scale down back to button
    Animated.timing(bookmarksScale, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen('feed');
    });
  };

  const navigateToSettings = () => {
    setPreviousScreen('feed');
    setCurrentScreen('settings');
    
    // Scale/morph from button position (top-right area)
    settingsScale.setValue(0);
    Animated.spring(settingsScale, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const navigateFromSettings = () => {
    // Scale down back to button
    Animated.timing(settingsScale, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen('feed');
    });
  };

  // Show splash screen on launch
  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <WeirdSplash onFinish={() => setShowSplash(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />
      
      {/* Base layer - Feed */}
      <View style={styles.screenContainer}>
        <FeedScreen 
          onArticleSelect={navigateToArticle} 
          onBookmarksPress={navigateToBookmarks}
          onSettingsPress={navigateToSettings}
        />
      </View>
      
      {/* Bookmarks layer - morphs from button */}
      {currentScreen === 'bookmarks' && (
        <Animated.View 
          style={[
            styles.bookmarksContainer,
            { 
              backgroundColor: theme.background,
              transform: [
                { translateX: bookmarksScale.interpolate({ inputRange: [0, 1], outputRange: [-width / 2 + 40, 0] }) },
                { translateY: bookmarksScale.interpolate({ inputRange: [0, 1], outputRange: [-height / 2 + 50, 0] }) },
                { scale: bookmarksScale },
              ],
              opacity: bookmarksScale,
            }
          ]}
        >
          <BookmarksScreen 
            onBack={navigateToFeed} 
            onArticleSelect={navigateToArticle}
          />
        </Animated.View>
      )}
      
      {/* Settings layer - morphs from button */}
      {currentScreen === 'settings' && (
        <Animated.View 
          style={[
            styles.settingsContainer,
            { 
              backgroundColor: theme.background,
              transform: [
                { translateX: settingsScale.interpolate({ inputRange: [0, 1], outputRange: [width / 2 - 40, 0] }) },
                { translateY: settingsScale.interpolate({ inputRange: [0, 1], outputRange: [-height / 2 + 50, 0] }) },
                { scale: settingsScale },
              ],
              opacity: settingsScale,
            }
          ]}
        >
          <SettingsScreen onBack={navigateFromSettings} />
        </Animated.View>
      )}
      
      {/* Article layer - hero animation */}
      {currentScreen === 'article' && selectedArticle && (
        <Animated.View 
          style={[
            styles.articleContainer,
            { 
              backgroundColor: 'transparent',
              opacity: articleOpacity,
              transform: [
                { scale: articleScale },
                { translateY: articleSlide },
              ],
            }
          ]}
        >
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <ArticleScreen article={selectedArticle} onBack={navigateBack} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  articleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bookmarksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  settingsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && Platform.OS !== 'web') {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // On web, don't wait for fonts (they load async via CSS)
  if (!fontsLoaded && Platform.OS !== 'web') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color="#5BC0BE" />
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
