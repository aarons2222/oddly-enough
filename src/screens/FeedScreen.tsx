import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Article, Category } from '../types/Article';
import { fetchArticles, refreshArticles } from '../services/newsService';
import { preloadArticleContent } from '../services/contentCache';
import { ArticleCard } from '../components/ArticleCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { AdBanner } from '../components/AdBanner';
import { AnimatedCard } from '../components/AnimatedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { UfoRefresh } from '../components/UfoRefresh';
import { ScreenBugs } from '../components/ScreenBugs';
import { SettingsModal } from '../components/SettingsModal';
import { UfoAbduction } from '../components/UfoAbduction';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';

interface Props {
  onArticleSelect: (article: Article) => void;
  onBookmarksPress: () => void;
}

export function FeedScreen({ onArticleSelect, onBookmarksPress }: Props) {
  const { isDarkMode, addBookmark, removeBookmark, isBookmarked, setReaction, getReaction, chaosMode, bugsEnabled } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<Category>('all');

  // Deduplicate articles by similar titles or same URL
  const deduplicateArticles = (articles: Article[]): Article[] => {
    const seenTitles = new Map<string, Article>();
    const seenUrls = new Set<string>();
    
    for (const article of articles) {
      // Normalize URL (handle bbc.co.uk vs bbc.com, etc)
      const urlKey = article.url
        .split('?')[0]
        .replace(/\/$/, '')
        .replace('bbc.co.uk', 'bbc.com')
        .replace('www.', '');
      
      if (seenUrls.has(urlKey)) continue;
      
      // Normalize title: lowercase, remove punctuation, extra spaces
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Create a key from first 3 words (more aggressive dedup)
      const titleKey = normalizedTitle.split(' ').slice(0, 3).join(' ');
      
      if (!seenTitles.has(titleKey)) {
        seenTitles.set(titleKey, article);
        seenUrls.add(urlKey);
      }
    }
    
    return Array.from(seenTitles.values());
  };

  const [availableCategories, setAvailableCategories] = useState<Category[]>(['all']);

  const loadArticles = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Always fetch all articles first to determine available categories
      const allData = await fetchArticles('all');
      
      // Deduplicate TWICE - once on raw data, once after any transforms
      const uniqueAll = deduplicateArticles(allData);
      
      // Find which categories have articles
      const categoriesWithArticles = new Set<Category>(['all']);
      uniqueAll.forEach(article => categoriesWithArticles.add(article.category));
      setAvailableCategories(Array.from(categoriesWithArticles));
      
      // Filter for selected category, then dedupe again and sort
      const filtered = category === 'all' 
        ? uniqueAll 
        : uniqueAll.filter(a => a.category === category);
      
      // Sort: group by category (when showing all), then newest first within each
      const uniqueArticles = deduplicateArticles(filtered)
        .sort((a, b) => {
          if (category === 'all' && a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return b.publishedAt.getTime() - a.publishedAt.getTime();
        });
      
      setArticles(uniqueArticles);
      
      // Preload ALL article content in background
      const urlsToPreload = uniqueArticles.map(a => a.url);
      preloadArticleContent(urlsToPreload, 'https://oddly-enough-api.vercel.app');
    } catch (error) {
      // Error loading articles
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Force fresh fetch from API (bypass cache)
      const freshArticles = await refreshArticles();
      const filtered = category === 'all' 
        ? freshArticles 
        : freshArticles.filter(a => a.category === category);
      // Sort: group by category (when showing all), then newest first within each
      const uniqueArticles = deduplicateArticles(filtered)
        .sort((a, b) => {
          if (category === 'all' && a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return b.publishedAt.getTime() - a.publishedAt.getTime();
        });
      setArticles(uniqueArticles);
      
      // Update available categories
      const categoriesWithArticles = new Set<Category>(['all']);
      freshArticles.forEach(article => categoriesWithArticles.add(article.category));
      setAvailableCategories(Array.from(categoriesWithArticles));
      
      // Preload content
      const urlsToPreload = uniqueArticles.map(a => a.url);
      preloadArticleContent(urlsToPreload, 'https://oddly-enough-api.vercel.app');
    } catch (error) {
      // Refresh failed, keep current articles
    } finally {
      setRefreshing(false);
    }
  };

  const handleArticlePress = (article: Article) => {
    onArticleSelect(article);
  };

  const handleBookmark = (article: Article) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
  };

  const renderArticle = ({ item, index }: { item: Article; index: number }) => {
    // Chaos mode: random slight rotation for each card
    const chaosRotation = chaosMode ? (Math.sin(index * 1.5) * 2) : 0;
    const chaosScale = chaosMode ? (0.98 + Math.cos(index * 2) * 0.02) : 1;
    
    return (
      <AnimatedCard index={index}>
        <UfoAbduction enabled={chaosMode} articleId={item.id}>
          <View style={{ transform: [{ rotate: `${chaosRotation}deg` }, { scale: chaosScale }] }}>
            <ArticleCard
              article={{ ...item, isBookmarked: isBookmarked(item.id), reaction: getReaction(item.id) }}
              onPress={() => handleArticlePress(item)}
              onBookmark={() => handleBookmark(item)}
              onReact={(emoji) => setReaction(item.id, emoji)}
              theme={theme}
              chaosMode={chaosMode}
            />
          </View>
        </UfoAbduction>
      </AnimatedCard>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.card }]}>
      <TouchableOpacity onPress={onBookmarksPress} style={styles.headerButton}>
        <Ionicons name="bookmark" size={22} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRefresh} style={styles.logoContainer} activeOpacity={0.7}>
        <Text style={[styles.logo, { color: theme.text }]}>Oddly</Text>
        <Text style={styles.logoAccent}>Enough</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerButton}>
        <Ionicons 
          name="settings-outline" 
          size={22} 
          color={theme.text} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={[styles.emptyText, { color: theme.textMuted }]}>
        No stories in this category yet
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {bugsEnabled && <ScreenBugs chaosMode={chaosMode} />}
      {renderHeader()}
      <CategoryFilter selected={category} onSelect={handleCategoryChange} theme={theme} availableCategories={availableCategories} />
      
      {loading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScrollEndDrag={(e) => {
            if (e.nativeEvent.contentOffset.y < -80 && !refreshing) {
              handleRefresh();
            }
          }}
          ListHeaderComponent={refreshing ? <UfoRefresh refreshing={refreshing} /> : null}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={() => <View style={{ height: 80 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Bottom Ad Banner */}
      <AdBanner style={styles.adBanner} />
      
      {/* Settings Modal */}
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
  },
  logoAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B6B',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
