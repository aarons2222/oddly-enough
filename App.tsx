import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from './src/screens/FeedScreen';
import { ArticleScreen } from './src/screens/ArticleScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { WeirdSplash } from './src/components/WeirdSplash';
import { AppProvider, useApp, lightTheme, darkTheme } from './src/context/AppContext';
import { Article } from './src/types/Article';

type Screen = 'feed' | 'article' | 'bookmarks';

const { height } = Dimensions.get('window');

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
  const articleSlideAnim = useRef(new Animated.Value(height)).current;

  const navigateToArticle = (article: Article) => {
    setSelectedArticle(article);
    setPreviousScreen(currentScreen);
    setCurrentScreen('article');
    
    // Slide up animation
    articleSlideAnim.setValue(height);
    Animated.spring(articleSlideAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  };

  const navigateBack = () => {
    // Slide down animation
    Animated.timing(articleSlideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(previousScreen);
      setSelectedArticle(null);
    });
  };

  const navigateToBookmarks = () => {
    setPreviousScreen('feed');
    
    // Fade transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen('bookmarks');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const navigateToFeed = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen('feed');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
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
      
      {/* Base layer - Feed or Bookmarks */}
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        {currentScreen === 'feed' || currentScreen === 'article' ? (
          <FeedScreen 
            onArticleSelect={navigateToArticle} 
            onBookmarksPress={navigateToBookmarks}
          />
        ) : (
          <BookmarksScreen 
            onBack={navigateToFeed} 
            onArticleSelect={navigateToArticle}
          />
        )}
      </Animated.View>
      
      {/* Article layer - slides up over feed */}
      {currentScreen === 'article' && selectedArticle && (
        <Animated.View 
          style={[
            styles.articleContainer,
            { 
              backgroundColor: 'transparent',
              transform: [{ translateY: articleSlideAnim }] 
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
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
