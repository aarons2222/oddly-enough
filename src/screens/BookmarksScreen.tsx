import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Article } from '../types/Article';
import { ArticleCard } from '../components/ArticleCard';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';

interface Props {
  onBack: () => void;
  onArticleSelect: (article: Article) => void;
}

export function BookmarksScreen({ onBack, onArticleSelect }: Props) {
  const { isDarkMode, bookmarks, removeBookmark, isBookmarked } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleBookmarkToggle = (articleId: string) => {
    if (isBookmarked(articleId)) {
      removeBookmark(articleId);
    }
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      article={{ ...item, isBookmarked: true }}
      onPress={() => onArticleSelect(item)}
      onBookmark={() => handleBookmarkToggle(item.id)}
      theme={theme}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={[styles.emptyText, { color: theme.textMuted }]}>
        No bookmarks yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
        Tap the bookmark icon on any article to save it
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={onBack} style={styles.closeButton} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: theme.text }]}>Saved</Text>
          <Text style={styles.logoAccent}>Stories</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={bookmarks}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
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
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    } : {}),
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
  placeholder: {
    width: 40,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
