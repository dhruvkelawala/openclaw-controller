import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { tokens } from "./design-tokens";

const { width, height } = Dimensions.get("window");

// Animated grid background for industrial-cyber aesthetic
export function AnimatedBackground() {
  const gridOpacity = useRef(new Animated.Value(0.03)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Grid lines */}
      <Animated.View style={[styles.gridContainer, { opacity: gridOpacity }]}>
        {/* Horizontal lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: (height / 20) * i,
                width: "100%",
                height: 1,
              },
            ]}
          />
        ))}
        {/* Vertical lines */}
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: (width / 15) * i,
                height: "100%",
                width: 1,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Accent glow spots */}
      <Animated.View
        style={[
          styles.glowSpot,
          {
            top: height * 0.1,
            right: -100,
            backgroundColor: tokens.colors.accent.cyan,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowSpot,
          {
            bottom: height * 0.2,
            left: -100,
            backgroundColor: tokens.colors.accent.crimson,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Noise texture overlay */}
      <View style={styles.noiseOverlay} />
    </View>
  );
}

// Scan line effect for industrial feel
export function ScanLines() {
  const translateY = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateY, {
        toValue: height,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
      pointerEvents="none"
    />
  );
}

// Animated counter for numbers
export function AnimatedCounter({ value, style }: { value: number; style?: object }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value,
      stiffness: 100,
      damping: 15,
      useNativeDriver: true,
    }).start();
  }, [value]);

  // Simplified - in real implementation, would use animated number interpolation
  return <Animated.Text style={style}>{value}</Animated.Text>;
}

const styles = StyleSheet.create({
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.colors.bg.primary,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: tokens.colors.accent.cyan,
  },
  glowSpot: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
    filter: "blur(100px)",
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: "#000",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: tokens.colors.accent.cyan,
    opacity: 0.1,
    shadowColor: tokens.colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
