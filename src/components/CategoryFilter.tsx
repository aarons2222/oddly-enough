import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { Category, CATEGORIES } from '../types/Article';
import { Theme, lightTheme } from '../context/AppContext';

interface Props {
  selected: Category;
  onSelect: (category: Category) => void;
  theme?: Theme;
  availableCategories?: Category[];
}

export function CategoryFilter({ selected, onSelect, theme = lightTheme, availableCategories }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const chipPositions = useRef<{ [key: string]: { x: number; width: number } }>({});

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

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
});
