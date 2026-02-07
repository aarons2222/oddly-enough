import React from 'react';
import { Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Emoji fallbacks for web (icon fonts often fail to load in web/WebView)
const WEB_EMOJI_MAP: Record<string, string> = {
  // Header
  'bookmark': '🔖',
  'bookmark-outline': '🔖',
  'settings-outline': '⚙️',
  'close': '✕',
  'add': '＋',
  'add-outline': '＋',
  
  // Sort & Filter
  'time-outline': '🕐',
  'time': '🕐',
  'flame-outline': '🔥',
  'flame': '🔥',
  'hourglass-outline': '⏳',
  'hourglass': '⏳',
  'chevron-down': '▾',
  'checkmark': '✓',
  
  // Navigation
  'arrow-back': '←',
  'chevron-back': '‹',
  'chevron-forward': '›',
  
  // Actions
  'share-outline': '↗',
  'share-social-outline': '↗',
  'open-outline': '↗',
  'copy-outline': '📋',
  'link-outline': '🔗',
  'trash-outline': '🗑',
  
  // Misc
  'moon': '🌙',
  'moon-outline': '🌙',
  'sunny': '☀️',
  'sunny-outline': '☀️',
  'bug': '🐛',
  'bug-outline': '🐛',
  'refresh': '↻',
  'refresh-outline': '↻',
  'search': '🔍',
  'search-outline': '🔍',
  'star': '⭐',
  'star-outline': '☆',
  'heart': '❤️',
  'heart-outline': '♡',
  'globe-outline': '🌐',
  'information-circle-outline': 'ℹ️',
  'alert-circle-outline': '⚠️',
  'warning-outline': '⚠️',
  'eye-outline': '👁',
  'eye-off-outline': '🚫',
  'remove': '−',
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function PlatformIcon({ name, size = 24, color = '#000', style }: Props) {
  // On native, use Ionicons (always works — fonts bundled in binary)
  if (Platform.OS !== 'web') {
    return <Ionicons name={name as any} size={size} color={color} style={style} />;
  }
  
  // On web, use emoji/text fallbacks (100% reliable, no font loading needed)
  const emoji = WEB_EMOJI_MAP[name];
  if (emoji) {
    return (
      <Text 
        style={[
          { 
            fontSize: size * 0.85, 
            color, 
            textAlign: 'center',
            lineHeight: size * 1.1,
            width: size,
          }, 
          style
        ]}
      >
        {emoji}
      </Text>
    );
  }
  
  // Last resort: try Ionicons anyway
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
}
