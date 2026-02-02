import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Map Ionicon names to simple flat symbols for web
const ICON_TO_EMOJI: Record<string, string> = {
  // Navigation & Actions
  'arrow-back': '←',
  'arrow-forward': '→',
  'chevron-back': '‹',
  'chevron-down': '▾',
  'chevron-forward': '›',
  'close': '✕',
  'settings-outline': '⚙',
  'bookmark': '⚑',
  'bookmark-outline': '⚐',
  'share-outline': '↗',
  'share-social-outline': '↗',
  'open-outline': '↗',
  'checkmark': '✓',
  'add': '+',
  'add-outline': '+',
  'remove': '−',
  'heart': '♥',
  'heart-outline': '♡',
  
  // Sort & Filter
  'time-outline': '◷',
  'time': '◷',
  'flame-outline': '♦',
  'flame': '♦',
  'hourglass-outline': '⧗',
  'hourglass': '⧗',
  'filter-outline': '≡',
  'funnel-outline': '≡',
  
  // Misc
  'moon': '☾',
  'moon-outline': '☾',
  'sunny': '☀',
  'sunny-outline': '☀',
  'bug': '⚑',
  'bug-outline': '⚑',
  'infinite-outline': '∞',
  'refresh': '↻',
  'refresh-outline': '↻',
  'ellipsis-horizontal': '···',
  'ellipsis-vertical': '⋮',
  'search': '○',
  'search-outline': '○',
  'star': '★',
  'star-outline': '☆',
  'trash-outline': '▢',
  'copy-outline': '⧉',
  'link-outline': '⛓',
  'globe-outline': '◎',
  'information-circle-outline': 'ⓘ',
  'alert-circle-outline': '⚠',
  'warning-outline': '⚠',
  'chatbubble-outline': '◫',
  'eye-outline': '◉',
  'eye-off-outline': '◎',
  
  // Share options
  'image-outline': '▣',
  'logo-twitter': '𝕏',
  'logo-whatsapp': '◫',
  'paper-plane': '➤',
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function PlatformIcon({ name, size = 24, color = '#000', style }: Props) {
  // On native, use Ionicons
  if (Platform.OS !== 'web') {
    return <Ionicons name={name as any} size={size} color={color} style={style} />;
  }
  
  // On web, use simple symbol fallback
  const symbol = ICON_TO_EMOJI[name] || '•';
  const fontSize = size * 0.9;
  
  return (
    <Text 
      style={[
        styles.symbol, 
        { fontSize, color, lineHeight: size },
        style
      ]}
    >
      {symbol}
    </Text>
  );
}

const styles = StyleSheet.create({
  symbol: {
    textAlign: 'center',
    fontWeight: '400',
  },
});
