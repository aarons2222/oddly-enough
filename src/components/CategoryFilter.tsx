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
  const [showSortMenu, setShowSortMenu] = useState(false);
  const morphAnim = useRef(new Animated.Value(0)).current;

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
    setShowSortMenu(true);
    Animated.spring(morphAnim, {
      toValue: 1,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.spring(morphAnim, {
      toValue: 0,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start(() => {
      setShowSortMenu(false);
    });
  };

  const handleSelect = (option: SortOption) => {
    onSortChange?.(option);
    closeMenu();
  };

  // Animated styles for morphing
  const morphWidth = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [52, 180],
  });

  const morphHeight = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 130],
  });

  const morphBorderRadius = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 16],
  });

  const menuOpacity = morphAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const buttonOpacity = morphAnim.interpolate({
    inputRange: [0, 0.3],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={styles.row}>
        {/* Sort Button / Morphing Menu */}
        <View style={styles.sortWrapper}>
          <Animated.View
            style={[
              styles.morphContainer,
              {
                backgroundColor: theme.categoryBg,
                width: morphWidth,
                height: morphHeight,
                borderRadius: morphBorderRadius,
              },
            ]}
          >
            {/* Collapsed button content */}
            <Animated.View style={[styles.buttonContent, { opacity: buttonOpacity }]}>
              <TouchableOpacity
                style={styles.sortButtonInner}
                onPress={openMenu}
                activeOpacity={0.7}
              >
                <Ionicons name={currentSort.icon as any} size={16} color={theme.accent} />
                <Ionicons name="chevron-down" size={14} color={theme.accent} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </Animated.View>

            {/* Expanded menu content - only render when menu is open */}
            {showSortMenu && (
              <Animated.View 
                style={[styles.menuContent, { opacity: menuOpacity }]}
              >
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      sortBy === option.id && { backgroundColor: theme.accent + '20' },
                    ]}
                    onPress={() => handleSelect(option.id)}
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

          {/* Backdrop to close menu */}
          {showSortMenu && (
            <Pressable style={styles.backdrop} onPress={closeMenu} />
          )}
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
  },
  morphContainer: {
    overflow: 'hidden',
  },
  buttonContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  menuContent: {
    padding: 8,
  },
  backdrop: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -500,
    bottom: -1000,
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
  chipSelected: {
    backgroundColor: '#1a1a1a',
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#fff',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sortOptionText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
  },
});
