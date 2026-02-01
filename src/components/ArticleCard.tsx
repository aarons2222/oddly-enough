import React, { useState, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Article, CATEGORIES } from '../types/Article';
import { formatDistanceToNow } from 'date-fns';
import { Theme, lightTheme } from '../context/AppContext';
import { ArticleStats, formatViews, getDominantReaction } from '../services/statsService';

interface Props {
  article: Article & { reaction?: string };
  onPress: () => void;
  onBookmark?: () => void;
  onReact?: (emoji: string) => void;
  theme?: Theme;
  chaosMode?: boolean;
  stats?: ArticleStats;
}

// Chaos fonts
const CHAOS_FONTS = ['normal', 'italic'];

export const ArticleCard = memo(function ArticleCard({ article, onPress, onBookmark, onReact, theme = lightTheme, chaosMode = false, stats }: Props) {
  const [imageError, setImageError] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const categoryInfo = CATEGORIES.find(c => c.id === article.category);
  
  // Chaos effects based on article id hash
  const chaosHash = article.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const chaosFontStyle = chaosMode && chaosHash % 7 === 0 ? 'italic' : 'normal';
  const chaosTextColor = chaosMode && chaosHash % 11 === 0 ? '#FF6B6B' : theme.text;
  const chaosBorderColor = chaosMode && chaosHash % 5 === 0 ? ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'][chaosHash % 4] : 'transparent';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    setFabOpen(!fabOpen);
    Animated.spring(fabAnim, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // FAB button animations - horizontal row to the left
  const fab1Style = {
    transform: [
      { scale: fabAnim },
      { translateX: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
      { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
    ],
    opacity: fabAnim,
  };
  const fab2Style = {
    transform: [
      { scale: fabAnim },
      { translateX: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -95] }) },
      { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
    ],
    opacity: fabAnim,
  };
  const fab3Style = {
    transform: [
      { scale: fabAnim },
      { translateX: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -140] }) },
      { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
    ],
    opacity: fabAnim,
  };
  const fab4Style = {
    transform: [
      { scale: fabAnim },
      { translateX: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -185] }) },
      { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
    ],
    opacity: fabAnim,
  };
  
  const handleShare = async () => {
    const shareText = `${article.title}\n\n${article.summary}\n\nRead more: ${article.url}`;
    
    if (Platform.OS === 'web') {
      // Try Web Share API first (works on mobile Safari)
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: article.title,
            text: article.summary,
            url: article.url,
          });
          return;
        } catch (error: any) {
          // User cancelled or not supported - fall through to clipboard
          if (error.name === 'AbortError') return;
        }
      }
      
      // Fallback: copy to clipboard
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(article.url);
          alert('Link copied to clipboard!');
        } else {
          // Last resort fallback
          const textArea = document.createElement('textarea');
          textArea.value = article.url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Link copied!');
        }
      } catch (err) {
        alert(`Share this link: ${article.url}`);
      }
    } else {
      // Native share
      const { Share } = require('react-native');
      try {
        await Share.share({
          title: article.title,
          message: shareText,
          url: article.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  const timeAgo = formatDistanceToNow(article.publishedAt, { addSuffix: true });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.card, 
          { 
            backgroundColor: theme.card, 
            transform: [{ scale: scaleAnim }],
            borderWidth: chaosMode ? 2 : 0,
            borderColor: chaosBorderColor,
          }
        ]}
      >
      <View style={styles.imageContainer}>
        {article.imageUrl && article.imageUrl.length > 0 && !imageError ? (
          <Image 
            source={article.imageUrl}
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk"
            onError={() => setImageError(true)}
          />
        ) : null}
        
        {/* Always show placeholder behind image, visible when image fails or is loading */}
        {(!article.imageUrl || imageError) && (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderEmoji}>{categoryInfo?.emoji || '📰'}</Text>
            <Text style={[styles.placeholderText, { color: '#FF6B6B' }]}>{article.source}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.meta}>
          <View style={[styles.categoryBadge, { backgroundColor: theme.categoryBg }]}>
            <Text style={styles.categoryEmoji}>{categoryInfo?.emoji}</Text>
            <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
              {categoryInfo?.label}
            </Text>
          </View>
          <Text style={[styles.source, { color: theme.textMuted }]}>{article.source}</Text>
          <Text style={[styles.dot, { color: theme.border }]}>•</Text>
          <Text style={[styles.time, { color: theme.textMuted }]}>{timeAgo}</Text>
        </View>
        
        <Text style={[styles.title, { color: chaosTextColor, fontStyle: chaosFontStyle }]} numberOfLines={3}>
          {article.title}
        </Text>
        
        <Text style={[styles.summary, { color: theme.textSecondary }]} numberOfLines={2}>
          {article.summary}
        </Text>
        
        {/* Stats Row - bottom left */}
        <View style={styles.statsRow}>
          {stats && (stats.reactions['🤯'] > 0 || stats.reactions['😂'] > 0 || stats.reactions['🤮'] > 0) ? (
            <Text style={[styles.statsText, { color: theme.textMuted }]}>
              {stats.reactions['🤯'] > 0 ? `${stats.reactions['🤯']} 🤯  ` : ''}
              {stats.reactions['😂'] > 0 ? `${stats.reactions['😂']} 😂  ` : ''}
              {stats.reactions['🤮'] > 0 ? `${stats.reactions['🤮']} 🤮` : ''}
            </Text>
          ) : (
            <View />
          )}
        </View>
        
        {/* FAB Container */}
        <View style={styles.fabContainer}>
          {/* Expanded buttons */}
          <Animated.View style={[styles.fabOption, fab1Style]}>
            <TouchableOpacity 
              onPress={() => { onReact?.('🤯'); toggleFab(); }} 
              style={[styles.fabOptionButton, article.reaction === '🤯' && styles.fabOptionActive]}
            >
              <View style={styles.fabEmojiWrap}><Text style={styles.fabEmoji}>🤯</Text></View>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabOption, fab2Style]}>
            <TouchableOpacity 
              onPress={() => { onReact?.('😂'); toggleFab(); }} 
              style={[styles.fabOptionButton, article.reaction === '😂' && styles.fabOptionActive]}
            >
              <View style={styles.fabEmojiWrap}><Text style={styles.fabEmoji}>😂</Text></View>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabOption, fab3Style]}>
            <TouchableOpacity 
              onPress={() => { onReact?.('🤮'); toggleFab(); }} 
              style={[styles.fabOptionButton, article.reaction === '🤮' && styles.fabOptionActive]}
            >
              <View style={styles.fabEmojiWrap}><Text style={styles.fabEmoji}>🤮</Text></View>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabOption, fab4Style]}>
            <TouchableOpacity 
              onPress={() => { onBookmark?.(); toggleFab(); }} 
              style={styles.fabOptionButton}
            >
              <Ionicons 
                name={article.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                size={20} 
                color={article.isBookmarked ? '#FF6B6B' : '#fff'} 
              />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Main FAB button */}
          <TouchableOpacity onPress={toggleFab} style={styles.fabMain}>
            <Animated.View style={{ 
              transform: [{ 
                rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) 
              }] 
            }}>
              <Ionicons name="add" size={24} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    position: 'relative',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  time: {
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fabMain: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabOption: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 10,
  },
  fabOptionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  fabOptionActive: {
    backgroundColor: '#FF6B6B',
  },
  fabEmojiWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabEmoji: {
    fontSize: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
