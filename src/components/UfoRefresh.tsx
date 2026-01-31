import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface Props {
  refreshing: boolean;
}

export function UfoRefresh({ refreshing }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const beamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // Spin the UFO
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Bounce up and down
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 5,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Beam animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(beamAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(beamAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinAnim.setValue(0);
      bounceAnim.setValue(0);
      beamAnim.setValue(0);
    }
  }, [refreshing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.ufoContainer,
          { 
            transform: [
              { translateY: bounceAnim },
              { rotate: spin },
            ] 
          }
        ]}
      >
        <Text style={styles.ufo}>🛸</Text>
      </Animated.View>
      <Animated.View style={[styles.beam, { opacity: beamAnim }]}>
        <Text style={styles.beamText}>📡</Text>
      </Animated.View>
      <Text style={styles.text}>Scanning for weird...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ufoContainer: {
    marginBottom: 8,
  },
  ufo: {
    fontSize: 40,
  },
  beam: {
    marginBottom: 8,
  },
  beamText: {
    fontSize: 20,
  },
  text: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
