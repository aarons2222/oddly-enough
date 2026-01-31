import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  enabled: boolean;
  children: React.ReactNode;
  articleId: string;
}

export function UfoAbduction({ enabled, children, articleId }: Props) {
  const [isAbducting, setIsAbducting] = useState(false);
  const [showUfo, setShowUfo] = useState(false);
  
  const ufoX = useRef(new Animated.Value(-100)).current;
  const ufoY = useRef(new Animated.Value(-50)).current;
  const beamOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!enabled) return;
    
    // Random chance to trigger abduction (very rare - about 1 in 50 cards, once)
    const hash = articleId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const shouldAbduct = hash % 50 === 7; // Specific hash triggers it
    
    if (!shouldAbduct) return;
    
    // Delay before abduction starts (random 3-8 seconds after render)
    const delay = 3000 + Math.random() * 5000;
    
    const timeout = setTimeout(() => {
      setIsAbducting(true);
      setShowUfo(true);
      
      // UFO flies in
      Animated.timing(ufoX, {
        toValue: width / 2 - 30,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Hover and show beam
        Animated.parallel([
          Animated.timing(beamOpacity, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ufoY, {
              toValue: -40,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ufoY, {
              toValue: -50,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Abduct the card!
          Animated.parallel([
            Animated.timing(cardY, {
              toValue: -height,
              duration: 1000,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(cardScale, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // UFO flies away
            Animated.parallel([
              Animated.timing(beamOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(ufoX, {
                toValue: width + 100,
                duration: 600,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(ufoY, {
                toValue: -200,
                duration: 600,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setShowUfo(false);
            });
          });
        });
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [enabled, articleId]);

  return (
    <Animated.View style={styles.container}>
      {/* The card */}
      <Animated.View
        style={{
          transform: [
            { translateY: cardY },
            { scale: cardScale },
          ],
          opacity: cardOpacity,
        }}
      >
        {children}
      </Animated.View>
      
      {/* UFO and beam */}
      {showUfo && (
        <>
          <Animated.Text
            style={[
              styles.ufo,
              {
                transform: [
                  { translateX: ufoX },
                  { translateY: ufoY },
                ],
              },
            ]}
          >
            🛸
          </Animated.Text>
          <Animated.View
            style={[
              styles.beam,
              {
                left: width / 2 - 40,
                opacity: beamOpacity,
              },
            ]}
          />
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  ufo: {
    position: 'absolute',
    fontSize: 50,
    top: 0,
    zIndex: 100,
  },
  beam: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: 300,
    backgroundColor: '#7CFC00',
    opacity: 0.4,
    zIndex: 50,
  },
});
