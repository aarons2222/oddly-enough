import React from 'react';
import { Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Web SVG icons as raw strings rendered via dangerouslySetInnerHTML.
 * These are Feather-style flat outline icons — visually consistent with Ionicons on native.
 * No font loading or external deps required.
 */
function makeSvg(paths: string, size: number, color: string, viewBox = '0 0 24 24'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function makeSvgFilled(paths: string, size: number, color: string, viewBox = '0 0 24 24'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${color}" stroke="none">${paths}</svg>`;
}

const ICON_PATHS: Record<string, (s: number, c: string) => string> = {
  // Bookmark
  'bookmark': (s, c) => makeSvgFilled('<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-6-4-6 4V4z"/>', s, c),
  'bookmark-outline': (s, c) => makeSvg('<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-6-4-6 4V4z"/>', s, c),
  
  // Settings gear
  'settings-outline': (s, c) => makeSvg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>', s, c),
  
  // Close / X
  'close': (s, c) => makeSvg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', s, c),
  
  // Plus
  'add': (s, c) => makeSvg('<line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>', s, c),
  'add-outline': (s, c) => makeSvg('<line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>', s, c),
  
  // Minus
  'remove': (s, c) => makeSvg('<line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>', s, c),
  
  // Clock
  'time-outline': (s, c) => makeSvg('<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>', s, c),
  'time': (s, c) => makeSvg('<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>', s, c),
  
  // Flame
  'flame-outline': (s, c) => makeSvg('<path d="M12 2c.5 3.5-1.5 6-1.5 6C12.5 11 14 9.5 14 9.5c0 3.5-2 6.5-2 6.5 1.5 0 3-1 3-1 0 2-1.5 5-5 7-3.5-2-5-5-5-7 0 0 1.5 1 3 1 0 0-2-3-2-6.5 0 0 1.5 1.5 3.5-1.5 0 0-2-2.5-1.5-6z"/>', s, c),
  'flame': (s, c) => makeSvg('<path d="M12 2c.5 3.5-1.5 6-1.5 6C12.5 11 14 9.5 14 9.5c0 3.5-2 6.5-2 6.5 1.5 0 3-1 3-1 0 2-1.5 5-5 7-3.5-2-5-5-5-7 0 0 1.5 1 3 1 0 0-2-3-2-6.5 0 0 1.5 1.5 3.5-1.5 0 0-2-2.5-1.5-6z"/>', s, c),
  
  // Hourglass
  'hourglass-outline': (s, c) => makeSvg('<path d="M6.5 2h11v5l-4 3 4 3v5h-11v-5l4-3-4-3V2z"/><line x1="6" y1="2" x2="18" y2="2"/><line x1="6" y1="22" x2="18" y2="22"/>', s, c),
  'hourglass': (s, c) => makeSvg('<path d="M6.5 2h11v5l-4 3 4 3v5h-11v-5l4-3-4-3V2z"/><line x1="6" y1="2" x2="18" y2="2"/><line x1="6" y1="22" x2="18" y2="22"/>', s, c),
  
  // Chevrons
  'chevron-down': (s, c) => makeSvg('<polyline points="6,9 12,15 18,9" stroke-width="2"/>', s, c),
  'chevron-back': (s, c) => makeSvg('<polyline points="15,18 9,12 15,6" stroke-width="2"/>', s, c),
  'chevron-forward': (s, c) => makeSvg('<polyline points="9,6 15,12 9,18" stroke-width="2"/>', s, c),
  
  // Arrow back
  'arrow-back': (s, c) => makeSvg('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>', s, c),
  
  // Checkmark
  'checkmark': (s, c) => makeSvg('<polyline points="20,6 9,17 4,12" stroke-width="2.5"/>', s, c),
  
  // Share
  'share-outline': (s, c) => makeSvg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>', s, c),
  'share-social-outline': (s, c) => makeSvg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>', s, c),
  
  // External link
  'open-outline': (s, c) => makeSvg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>', s, c),
  
  // Moon
  'moon': (s, c) => makeSvgFilled('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', s, c),
  'moon-outline': (s, c) => makeSvg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', s, c),
  
  // Sun
  'sunny': (s, c) => makeSvg('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>', s, c),
  'sunny-outline': (s, c) => makeSvg('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>', s, c),
  
  // Search
  'search': (s, c) => makeSvg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', s, c),
  'search-outline': (s, c) => makeSvg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', s, c),
  
  // Bug
  'bug': (s, c) => makeSvg('<rect x="8" y="6" width="8" height="14" rx="4"/><path d="M6 10H2"/><path d="M22 10h-4"/><path d="M6 18H2"/><path d="M22 18h-4"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', s, c),
  'bug-outline': (s, c) => makeSvg('<rect x="8" y="6" width="8" height="14" rx="4"/><path d="M6 10H2"/><path d="M22 10h-4"/><path d="M6 18H2"/><path d="M22 18h-4"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', s, c),
  
  // Refresh
  'refresh': (s, c) => makeSvg('<polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>', s, c),
  'refresh-outline': (s, c) => makeSvg('<polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>', s, c),
  
  // Globe
  'globe-outline': (s, c) => makeSvg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', s, c),
  
  // Info
  'information-circle-outline': (s, c) => makeSvg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>', s, c),
  
  // Warning
  'warning-outline': (s, c) => makeSvg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', s, c),
  'alert-circle-outline': (s, c) => makeSvg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', s, c),
  
  // Star
  'star': (s, c) => makeSvgFilled('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>', s, c),
  'star-outline': (s, c) => makeSvg('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>', s, c),
  
  // Heart
  'heart': (s, c) => makeSvgFilled('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>', s, c),
  'heart-outline': (s, c) => makeSvg('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>', s, c),
  
  // Trash
  'trash-outline': (s, c) => makeSvg('<polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', s, c),
  
  // Copy
  'copy-outline': (s, c) => makeSvg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', s, c),
  
  // Link
  'link-outline': (s, c) => makeSvg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', s, c),
  
  // Eye
  'eye-outline': (s, c) => makeSvg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', s, c),
  'eye-off-outline': (s, c) => makeSvg('<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>', s, c),
  
  // Ellipsis
  'ellipsis-horizontal': (s, c) => makeSvgFilled('<circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>', s, c),
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function PlatformIcon({ name, size = 24, color = '#000', style }: Props) {
  // On native, use Ionicons (fonts bundled in binary — always works)
  if (Platform.OS !== 'web') {
    return <Ionicons name={name as any} size={size} color={color} style={style} />;
  }
  
  // On web, use inline SVG strings (no font loading, no extra deps, flat style)
  const iconFn = ICON_PATHS[name];
  if (iconFn) {
    const svgHtml = iconFn(size, color);
    return (
      <View 
        style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
        // @ts-ignore - web-only prop
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    );
  }
  
  // Fallback: try Ionicons (may not render if font fails to load)
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
}
