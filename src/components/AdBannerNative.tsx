// Native-only AdMob implementation
// This file should never be imported on web

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const TEST_BANNER_ID = Platform.select({
  ios: TestIds.BANNER,
  android: TestIds.BANNER,
  default: TestIds.BANNER,
});

interface Props {
  style?: any;
}

export function AdBannerNative({ style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={TEST_BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => console.log('Ad loaded')}
        onAdFailedToLoad={(error) => console.log('Ad failed:', error)}
      />
    </View>
  );
}

export async function showInterstitialAdNative(): Promise<boolean> {
  try {
    const { InterstitialAd, AdEventType, TestIds } = require('react-native-google-mobile-ads');
    
    const interstitial = InterstitialAd.createForAdRequest(
      TestIds.INTERSTITIAL,
      { requestNonPersonalizedAdsOnly: true }
    );
    
    return new Promise((resolve) => {
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
        resolve(true);
      });
      
      interstitial.addAdEventListener(AdEventType.ERROR, () => {
        resolve(false);
      });
      
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        resolve(true);
      });
      
      interstitial.load();
    });
  } catch (e) {
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
