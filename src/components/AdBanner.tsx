import React, { useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

interface Props {
  style?: any;
  size?: 'banner' | 'largeBanner' | 'mediumRectangle';
}

// Real ad unit IDs
const BANNER_ID = Platform.select({
  ios: 'ca-app-pub-2072049563537333/6144896352',
  android: 'ca-app-pub-3940256099942544/6300978111', // TODO: create Android ad unit
  default: '',
});

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

// Only import on native platforms
if (Platform.OS !== 'web') {
  try {
    const RNMA = require('react-native-google-mobile-ads');
    BannerAd = RNMA.BannerAd;
    BannerAdSize = RNMA.BannerAdSize;
    TestIds = RNMA.TestIds;
  } catch (e) {
    console.log('[AdBanner] react-native-google-mobile-ads not available');
  }
}

export function AdBanner({ style, size = 'banner' }: Props) {
  const [adError, setAdError] = useState(false);

  // Web: no ads
  if (Platform.OS === 'web' || !BannerAd || adError) {
    return null;
  }

  const adSize = size === 'largeBanner' 
    ? BannerAdSize.LARGE_BANNER 
    : size === 'mediumRectangle'
    ? BannerAdSize.MEDIUM_RECTANGLE
    : BannerAdSize.BANNER;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={BANNER_ID}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[AdBanner] Failed to load:', error?.message);
          setAdError(true);
        }}
      />
    </View>
  );
}

// Inline banner for feed (between articles)
export function FeedAdBanner() {
  const [adError, setAdError] = useState(false);

  if (Platform.OS === 'web' || !BannerAd || adError) {
    return null;
  }

  return (
    <View style={styles.feedAd}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[FeedAdBanner] Failed to load:', error?.message);
          setAdError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAd: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
