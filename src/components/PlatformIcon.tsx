import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Map Ionicon names to FontAwesome5 equivalents for web
const IONICON_TO_FA: Record<string, { name: string; solid?: boolean }> = {
  // Navigation & Actions
  'arrow-back': { name: 'arrow-left' },
  'arrow-forward': { name: 'arrow-right' },
  'chevron-back': { name: 'chevron-left' },
  'chevron-down': { name: 'chevron-down' },
  'chevron-forward': { name: 'chevron-right' },
  'close': { name: 'times' },
  'settings-outline': { name: 'cog' },
  'bookmark': { name: 'bookmark', solid: true },
  'bookmark-outline': { name: 'bookmark' },
  'share-outline': { name: 'share' },
  'share-social-outline': { name: 'share-alt' },
  'open-outline': { name: 'external-link-alt' },
  'checkmark': { name: 'check' },
  'add': { name: 'plus' },
  'add-outline': { name: 'plus' },
  'remove': { name: 'minus' },
  'heart': { name: 'heart', solid: true },
  'heart-outline': { name: 'heart' },
  
  // Sort & Filter
  'time-outline': { name: 'clock' },
  'time': { name: 'clock', solid: true },
  'flame-outline': { name: 'fire' },
  'flame': { name: 'fire', solid: true },
  'hourglass-outline': { name: 'hourglass' },
  'hourglass': { name: 'hourglass', solid: true },
  'filter-outline': { name: 'filter' },
  'funnel-outline': { name: 'filter' },
  
  // Misc
  'moon': { name: 'moon', solid: true },
  'moon-outline': { name: 'moon' },
  'sunny': { name: 'sun', solid: true },
  'sunny-outline': { name: 'sun' },
  'bug': { name: 'bug', solid: true },
  'bug-outline': { name: 'bug' },
  'refresh': { name: 'sync' },
  'refresh-outline': { name: 'sync' },
  'ellipsis-horizontal': { name: 'ellipsis-h' },
  'ellipsis-vertical': { name: 'ellipsis-v' },
  'search': { name: 'search', solid: true },
  'search-outline': { name: 'search' },
  'star': { name: 'star', solid: true },
  'star-outline': { name: 'star' },
  'trash-outline': { name: 'trash' },
  'copy-outline': { name: 'copy' },
  'link-outline': { name: 'link' },
  'globe-outline': { name: 'globe' },
  'information-circle-outline': { name: 'info-circle' },
  'alert-circle-outline': { name: 'exclamation-circle' },
  'warning-outline': { name: 'exclamation-triangle' },
  'chatbubble-outline': { name: 'comment' },
  'eye-outline': { name: 'eye' },
  'eye-off-outline': { name: 'eye-slash' },
  
  // Share options
  'image-outline': { name: 'image' },
  'logo-twitter': { name: 'twitter' },
  'logo-whatsapp': { name: 'whatsapp' },
  'paper-plane': { name: 'paper-plane' },
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
  
  // On web, use FontAwesome5
  const faIcon = IONICON_TO_FA[name];
  if (faIcon) {
    return (
      <FontAwesome5 
        name={faIcon.name} 
        size={size * 0.85} 
        color={color} 
        solid={faIcon.solid}
        style={style} 
      />
    );
  }
  
  // Fallback to Ionicons if no mapping
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
}
