import React from 'react';
import { View, Platform } from 'react-native';

interface Props {
  style?: any;
}

// AdBanner - returns null on web, shows ads on native
// AdMob only works on native builds (iOS/Android)
export function AdBanner({ style }: Props) {
  // Web: no ads
  if (Platform.OS === 'web') {
    return null;
  }
  
  // Native: ads will be added when building native app
  // For now, return placeholder that will be replaced with real ads
  return <View style={style} />;
}

// Placeholder for interstitial ads
export async function showInterstitialAd(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  // Will be implemented in native build
  return false;
}
