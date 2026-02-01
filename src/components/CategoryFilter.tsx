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
      // Scroll to center the selected chip
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
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortMenu(false)}>
          <View style={[styles.sortMenu, { backgroundColor: theme.card }]}>
            <Text style={[styles.sortMenuTitle, { color: theme.text }]}>Sort by</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && { backgroundColor: theme.categoryBg },
                ]}
                onPress={() => {
                  onSortChange?.(option.id);
                  setShowSortMenu(false);
                }}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortMenu: {
    width: 250,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sortMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sortOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});
