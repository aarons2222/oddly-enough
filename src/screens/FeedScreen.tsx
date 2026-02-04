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
import { PlatformIcon } from '../components/PlatformIcon';
import { Article, Category } from '../types/Article';
import { fetchArticles, refreshArticles } from '../services/newsService';
import { getCachedArticles } from '../services/cacheService';
import { preloadArticleContent } from '../services/contentCache';
import { fetchStats, trackEvent, ArticleStats } from '../services/statsService';
import { ArticleCard } from '../components/ArticleCard';
import { CategoryFilter, SortOption } from '../components/CategoryFilter';
import { AdBanner } from '../components/AdBanner';
import { AnimatedCard } from '../components/AnimatedCard';
import { WeirdLoader } from '../components/WeirdLoader';
import { UfoRefresh } from '../components/UfoRefresh';
import { ScreenBugs } from '../components/ScreenBugs';
import { UfoAbduction } from '../components/UfoAbduction';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';

interface Props {
  onArticleSelect: (article: Article) => void;
  onBookmarksPress: () => void;
  onSettingsPress: () => void;
}

export function FeedScreen({ onArticleSelect, onBookmarksPress, onSettingsPress }: Props) {
  const { isDarkMode, addBookmark, removeBookmark, isBookmarked, setReaction, getReaction, chaosMode, bugsEnabled } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({});

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

  // Sort articles based on current sort option
  const sortArticles = useCallback((articles: Article[], stats: Record<string, ArticleStats> = {}) => {
    return [...articles].sort((a, b) => {
      switch (sortBy) {
        case 'trending': {
          const aStats = stats[a.id];
          const bStats = stats[b.id];
          const aTotal = aStats ? Object.values(aStats.reactions).reduce((sum, n) => sum + n, 0) : 0;
          const bTotal = bStats ? Object.values(bStats.reactions).reduce((sum, n) => sum + n, 0) : 0;
          if (bTotal !== aTotal) return bTotal - aTotal;
          return b.publishedAt.getTime() - a.publishedAt.getTime();
        }
        case 'oldest':
          return a.publishedAt.getTime() - b.publishedAt.getTime();
        case 'newest':
        default:
          return b.publishedAt.getTime() - a.publishedAt.getTime();
      }
    });
  }, [sortBy]);

  const loadArticles = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Fetch articles
      const allData = await fetchArticles('all');
      
      // Deduplicate TWICE - once on raw data, once after any transforms
      const uniqueAll = deduplicateArticles(allData);
      
      // Find which categories have articles
      const categoriesWithArticles = new Set<Category>(['all']);
      uniqueAll.forEach(article => categoriesWithArticles.add(article.category));
      setAvailableCategories(Array.from(categoriesWithArticles));
      
      // Fetch social proof stats for all articles
      const articleIds = uniqueAll.map(a => a.id);
      console.log('Fetching stats for:', articleIds.slice(0, 5));
      const stats = await fetchStats(articleIds);
      console.log('Got stats:', stats);
      setArticleStats(stats);
      
      // Store ALL raw articles (unfiltered) for category switching
      setRawArticles(uniqueAll);
      
      // Filter for selected category
      const filtered = category === 'all' 
        ? uniqueAll 
        : uniqueAll.filter(a => a.category === category);
      
      const sorted = sortArticles(filtered, stats);
      setArticles(sorted);
      
      // Preload ALL article content in background
      const urlsToPreload = uniqueAll.map(a => a.url);
      preloadArticleContent(urlsToPreload, 'https://oddly-enough-api.vercel.app');
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  // Initial load - try cache first for instant display
  useEffect(() => {
    const initLoad = async () => {
      try {
        const cached = await getCachedArticles();
        
        if (cached && cached.length > 0) {
          // Show cached immediately without loading state
          const uniqueArticles = deduplicateArticles(cached);
          setRawArticles(uniqueArticles);
          setArticles(uniqueArticles);
          setLoading(false);
          
          // Then refresh in background
          loadArticles(false);
        } else {
          // No cache, show loader and fetch
          await loadArticles(true);
        }
      } catch (error) {
        console.error('Init load error:', error);
        // Still try to load articles even if cache fails
        await loadArticles(true);
      }
    };
    
    initLoad();
  }, []); // Only run once on mount
  
  // Re-filter when category changes (no reload needed)
  useEffect(() => {
    if (rawArticles.length > 0) {
      const filtered = category === 'all' 
        ? rawArticles 
        : rawArticles.filter(a => a.category === category);
      const sorted = sortArticles(filtered, articleStats);
      setArticles(sorted);
    }
  }, [category, rawArticles, articleStats, sortArticles]);

  // Re-sort when sort option changes (without refetching)
  useEffect(() => {
    if (rawArticles.length > 0) {
      const sorted = sortArticles(rawArticles, articleStats);
      setArticles(sorted);
    }
  }, [sortBy, rawArticles, articleStats, sortArticles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Force fresh fetch from API (bypass cache)
      const freshArticles = await refreshArticles();
      const filtered = category === 'all' 
        ? freshArticles 
        : freshArticles.filter(a => a.category === category);
      const uniqueArticles = deduplicateArticles(filtered);
      
      // Update available categories
      const categoriesWithArticles = new Set<Category>(['all']);
      freshArticles.forEach(article => categoriesWithArticles.add(article.category));
      setAvailableCategories(Array.from(categoriesWithArticles));
      
      // Fetch stats
      const articleIds = uniqueArticles.map(a => a.id);
      const stats = await fetchStats(articleIds);
      setArticleStats(stats);
      
      // Store raw articles - sorting handled by useEffect
      setRawArticles(uniqueArticles);
      
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
    // Track view for social proof
    trackEvent(article.id, 'view');
    onArticleSelect(article);
  };

  const handleBookmark = (article: Article) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  const handleReaction = (articleId: string, emoji: '🤯' | '😂' | '🤮') => {
    const previousReaction = getReaction(articleId);
    
    // Optimistically update local stats
    setArticleStats(prev => {
      const current = prev[articleId] || { views: 0, reactions: { '🤯': 0, '😂': 0, '🤮': 0 } };
      const newReactions = { ...current.reactions };
      
      // If same emoji tapped again, remove it (toggle off)
      if (previousReaction === emoji) {
        newReactions[emoji] = Math.max(0, newReactions[emoji] - 1);
      } else {
        // Remove previous reaction if exists
        if (previousReaction) {
          newReactions[previousReaction as '🤯' | '😂' | '🤮'] = Math.max(0, newReactions[previousReaction as '🤯' | '😂' | '🤮'] - 1);
        }
        // Add new reaction
        newReactions[emoji] = newReactions[emoji] + 1;
      }
      
      return {
        ...prev,
        [articleId]: { ...current, reactions: newReactions }
      };
    });
    
    // Track reaction for social proof (fire and forget)
    trackEvent(articleId, 'reaction', emoji);
    setReaction(articleId, emoji);
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
  };

  const renderArticle = ({ item, index }: { item: Article; index: number }) => {
    // Chaos mode: random slight rotation for each card
    const chaosRotation = chaosMode ? (Math.sin(index * 1.5) * 2) : 0;
    const chaosScale = chaosMode ? (0.98 + Math.cos(index * 2) * 0.02) : 1;
    const stats = articleStats[item.id];
    
    return (
      <AnimatedCard index={index}>
        <UfoAbduction enabled={chaosMode} articleId={item.id}>
          <View style={{ transform: [{ rotate: `${chaosRotation}deg` }, { scale: chaosScale }] }}>
            <ArticleCard
              article={{ ...item, isBookmarked: isBookmarked(item.id), reaction: getReaction(item.id) }}
              onPress={() => handleArticlePress(item)}
              onBookmark={() => handleBookmark(item)}
              onReact={(emoji) => handleReaction(item.id, emoji as '🤯' | '😂' | '🤮')}
              theme={theme}
              chaosMode={chaosMode}
              stats={stats}
            />
          </View>
        </UfoAbduction>
      </AnimatedCard>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.card }]}>
      <TouchableOpacity onPress={onBookmarksPress} style={styles.headerButton}>
        <PlatformIcon name="bookmark" size={26} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRefresh} style={styles.logoContainer} activeOpacity={0.7}>
        <Text style={[styles.logo, { color: theme.text }]}>Oddly</Text>
        <Text style={styles.logoAccent}>Enough</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
        <PlatformIcon name="settings-outline" size={26} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  // Only show empty state if we've finished loading and truly have no articles
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  useEffect(() => {
    if (!loading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [loading, hasLoadedOnce]);

  const renderEmpty = () => {
    // Don't show empty state until we've completed at least one load
    if (!hasLoadedOnce) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No stories in this category yet
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {bugsEnabled && <ScreenBugs chaosMode={chaosMode} />}
      {renderHeader()}
      <CategoryFilter 
        selected={category} 
        onSelect={handleCategoryChange} 
        theme={theme} 
        availableCategories={availableCategories}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      {loading ? (
        <WeirdLoader theme={theme} />
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
