import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { tokens } from "../lib/design-tokens";
import { cn } from "../lib/cn";

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
    <View className="absolute inset-0" pointerEvents="none">
      {/* Base gradient overlay */}
      <View className="absolute inset-0" style={{ backgroundColor: tokens.colors.bg.primary }} />

      {/* Grid lines */}
      <Animated.View className="absolute inset-0" style={{ opacity: gridOpacity }}>
        {/* Horizontal lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute w-full"
            style={{
              top: (height / 20) * i,
              height: 1,
              backgroundColor: tokens.colors.accent.cyan,
            }}
          />
        ))}
        {/* Vertical lines */}
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute h-full"
            style={{
              left: (width / 15) * i,
              width: 1,
              backgroundColor: tokens.colors.accent.cyan,
            }}
          />
        ))}
      </Animated.View>

      {/* Accent glow spots */}
      <Animated.View
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.15]"
        style={{
          top: height * 0.1,
          right: -100,
          backgroundColor: tokens.colors.accent.cyan,
          transform: [{ scale: pulseAnim }],
        }}
      />
      <Animated.View
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.15]"
        style={{
          bottom: height * 0.2,
          left: -100,
          backgroundColor: tokens.colors.accent.crimson,
          transform: [{ scale: pulseAnim }],
        }}
      />

      {/* Noise texture overlay */}
      <View className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: "#000" }} />
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
      className="absolute left-0 right-0 h-[2px]"
      style={{
        transform: [{ translateY }],
        backgroundColor: tokens.colors.accent.cyan,
        opacity: 0.1,
        shadowColor: tokens.colors.accent.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      }}
      pointerEvents="none"
    />
  );
}

// Animated counter for numbers
export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
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
  return <Animated.Text className={cn(className)}>{value}</Animated.Text>;
}
