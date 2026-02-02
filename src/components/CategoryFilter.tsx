import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, CATEGORIES } from '../types/Article';
import { Theme, lightTheme } from '../context/AppContext';

export type SortOption = 'newest' | 'trending' | 'oldest';

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: 'newest', label: 'Newest', icon: 'time-outline' },
  { id: 'trending', label: 'Trending', icon: 'flame-outline' },
  { id: 'oldest', label: 'Oldest', icon: 'hourglass-outline' },
];

// Fixed dimensions
const COLLAPSED_WIDTH = 52;
const COLLAPSED_HEIGHT = 36;
const EXPANDED_WIDTH = 160;
const EXPANDED_HEIGHT = 140;

interface Props {
  selected: Category;
  onSelect: (category: Category) => void;
  theme?: Theme;
  availableCategories?: Category[];
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export function CategoryFilter({ selected, onSelect, theme = lightTheme, availableCategories, sortBy = 'newest', onSortChange }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const chipPositions = useRef<{ [key: string]: { x: number; width: number } }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  // Filter to only show categories that have articles
  const visibleCategories = availableCategories 
    ? CATEGORIES.filter(cat => availableCategories.includes(cat.id))
    : CATEGORIES;

  // Auto-scroll to selected category
  useEffect(() => {
    const pos = chipPositions.current[selected];
    if (pos && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ 
        x: Math.max(0, pos.x - 100), 
        animated: true 
      });
    }
  }, [selected]);

  const handleLayout = (category: Category, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    chipPositions.current[category] = { x, width };
  };

  const currentSort = SORT_OPTIONS.find(s => s.id === sortBy) || SORT_OPTIONS[0];

  const openMenu = () => {
    setIsExpanded(true);
    Animated.spring(animValue, {
      toValue: 1,
      friction: 10,
      tension: 100,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.spring(animValue, {
      toValue: 0,
      friction: 10,
      tension: 100,
      useNativeDriver: false,
    }).start(() => {
      setIsExpanded(false);
    });
  };

  const handleSelect = (option: SortOption) => {
    onSortChange?.(option);
    closeMenu();
  };

  // Animated interpolations
  const animatedWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_WIDTH, EXPANDED_WIDTH],
  });

  const animatedHeight = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
  });

  const menuOpacity = animValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  const buttonOpacity = animValue.interpolate({
    inputRange: [0, 0.4],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={styles.row}>
        {/* Sort Button / Morphing Menu */}
        <View style={styles.sortWrapper}>
          {/* Backdrop when expanded */}
          {isExpanded && (
            <Pressable 
              style={styles.backdrop} 
              onPress={closeMenu}
            />
          )}
          
          <Animated.View
            style={[
              styles.morphContainer,
              {
                backgroundColor: theme.card,
                width: animatedWidth,
                height: animatedHeight,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Collapsed button - always rendered */}
            <Animated.View 
              style={[
                styles.buttonContent, 
                { opacity: buttonOpacity }
              ]}
              pointerEvents={isExpanded ? 'none' : 'auto'}
            >
              <TouchableOpacity
                style={[styles.sortButtonInner, { backgroundColor: theme.categoryBg }]}
                onPress={openMenu}
                activeOpacity={0.7}
              >
                <Ionicons name={currentSort.icon as any} size={16} color={theme.accent} />
                <Ionicons name="chevron-down" size={12} color={theme.accent} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </Animated.View>

            {/* Expanded menu */}
            {isExpanded && (
              <Animated.View 
                style={[styles.menuContent, { opacity: menuOpacity }]}
              >
                <Text style={[styles.menuTitle, { color: theme.textSecondary }]}>Sort by</Text>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      sortBy === option.id && { backgroundColor: theme.accent + '15' },
                    ]}
                    onPress={() => handleSelect(option.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={option.icon as any} 
                      size={18} 
                      color={sortBy === option.id ? theme.accent : theme.textSecondary} 
                    />
                    <Text style={[
                      styles.sortOptionText, 
                      { color: sortBy === option.id ? theme.accent : theme.text }
                    ]}>
                      {option.label}
                    </Text>
                    {sortBy === option.id && (
                      <Ionicons name="checkmark" size={18} color={theme.accent} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </Animated.View>
        </View>

        {/* Category ScrollView */}
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {visibleCategories.map((category) => {
            const isSelected = selected === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onLayout={(e) => handleLayout(category.id, e)}
                style={[
                  styles.chip,
                  { backgroundColor: theme.categoryBg },
                  isSelected && { backgroundColor: theme.accent },
                ]}
                onPress={() => onSelect(category.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.label,
                    { color: theme.textSecondary },
                    isSelected && { color: '#fff', fontWeight: '700' },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortWrapper: {
    marginLeft: 16,
    marginRight: 8,
    zIndex: 200,
    width: COLLAPSED_WIDTH,
    height: COLLAPSED_HEIGHT,
  },
  morphContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: COLLAPSED_WIDTH,
    height: COLLAPSED_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: COLLAPSED_WIDTH - 4,
    height: COLLAPSED_HEIGHT - 4,
    borderRadius: 14,
  },
  menuContent: {
    padding: 8,
    paddingTop: 4,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backdrop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: Dimensions.get('window').width + 200,
    height: Dimensions.get('window').height + 200,
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sortOptionText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
  },
});
