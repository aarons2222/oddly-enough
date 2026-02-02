import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
  Modal,
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

  const handleSelect = (option: SortOption) => {
    onSortChange?.(option);
    setShowSortMenu(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={styles.row}>
        {/* Sort Button */}
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: theme.categoryBg }]}
          onPress={() => setShowSortMenu(true)}
          activeOpacity={0.7}
        >
          <Ionicons name={currentSort.icon as any} size={16} color={theme.accent} />
          <Ionicons name="chevron-down" size={14} color={theme.accent} style={{ marginLeft: 2 }} />
        </TouchableOpacity>

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

      {/* Sort Menu Modal */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSortMenu(false)}>
          <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.menuTitle, { color: theme.text }]}>Sort by</Text>
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
                  size={20} 
                  color={sortBy === option.id ? theme.accent : theme.textSecondary} 
                />
                <Text style={[
                  styles.sortOptionText, 
                  { color: sortBy === option.id ? theme.accent : theme.text }
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={20} color={theme.accent} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 36,
    borderRadius: 20,
    marginLeft: 16,
    marginRight: 8,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 200,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    opacity: 0.5,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  sortOptionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});
