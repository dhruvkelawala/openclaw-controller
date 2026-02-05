import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { ApprovalAction } from "../schemas";
import { tokens } from "../lib/design-tokens";
import { getActionStyles } from "../lib/styles";
import { cn } from "../lib/cn";

interface ApprovalCardProps {
  approval: ApprovalAction;
  onPress: (approval: ApprovalAction) => void;
  index?: number;
}

export function ApprovalCard({ approval, onPress, index = 0 }: ApprovalCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isExpired = Date.now() > approval.expiry;
  const timeLeft = Math.max(0, Math.floor((approval.expiry - Date.now()) / 1000));
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  const actionStyle = getActionStyles(approval.action);

  // Staggered entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        stiffness: 300,
        damping: 25,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        stiffness: 300,
        damping: 25,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Expiry pulse animation
  useEffect(() => {
    if (timeLeft < 60 && !isExpired) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [timeLeft, isExpired]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(approval)}
        activeOpacity={0.8}
        className={cn(
          "flex-row rounded-sm mb-3 overflow-hidden border",
          isExpired && "opacity-60",
          timeLeft < 60 && !isExpired && "shadow-lg"
        )}
        style={{
          backgroundColor: tokens.colors.bg.secondary,
          borderColor: isExpired
            ? tokens.colors.text.muted
            : timeLeft < 60 && !isExpired
              ? tokens.colors.accent.crimson
              : tokens.colors.border.default,
          shadowColor: timeLeft < 60 && !isExpired ? tokens.colors.accent.crimson : undefined,
          shadowOffset: timeLeft < 60 && !isExpired ? { width: 0, height: 0 } : undefined,
          shadowOpacity: timeLeft < 60 && !isExpired ? 0.3 : undefined,
          shadowRadius: timeLeft < 60 && !isExpired ? 10 : undefined,
          elevation: timeLeft < 60 && !isExpired ? 5 : undefined,
        }}
      >
        {/* Left accent bar */}
        <View className="w-1" style={{ backgroundColor: actionStyle.badgeText.color }} />

        <View className="flex-1 p-4">
          {/* Header row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-row items-center">
              <View style={[actionStyle.badge]}>
                <Text style={actionStyle.badgeText}>{approval.action}</Text>
              </View>
            </View>

            <Animated.View className="items-end" style={{ transform: [{ scale: pulseAnim }] }}>
              <Text
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: tokens.colors.text.primary,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {approval.amount}
              </Text>
              <Text
                className="text-xs font-semibold tracking-wide mt-0.5"
                style={{ color: tokens.colors.text.secondary }}
              >
                {approval.coin}
              </Text>
            </Animated.View>
          </View>

          {/* Divider */}
          <View className="h-px my-3" style={{ backgroundColor: tokens.colors.border.default }} />

          {/* Footer row */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Text
                className="text-[10px] font-bold tracking-wide mr-2"
                style={{ color: tokens.colors.text.muted }}
              >
                ID
              </Text>
              <Text
                className="text-[11px] font-medium tracking-wide"
                style={{
                  color: tokens.colors.text.tertiary,
                  fontFamily: "monospace",
                }}
              >
                {approval.id.slice(0, 12).toUpperCase()}...
              </Text>
            </View>

            <View className="flex-row items-center">
              {!isExpired ? (
                <>
                  <View
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{
                      backgroundColor:
                        timeLeft < 60 ? tokens.colors.accent.crimson : tokens.colors.accent.lime,
                    }}
                  />
                  <Text
                    className="text-sm font-semibold tracking-wide"
                    style={{
                      color:
                        timeLeft < 60 ? tokens.colors.accent.crimson : tokens.colors.text.secondary,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {minutesLeft.toString().padStart(2, "0")}:
                    {secondsLeft.toString().padStart(2, "0")}
                  </Text>
                </>
              ) : (
                <View className="px-2 py-0.5" style={{ backgroundColor: tokens.colors.text.muted }}>
                  <Text
                    className="text-[10px] font-extrabold tracking-wide"
                    style={{ color: tokens.colors.bg.primary }}
                  >
                    EXPIRED
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Arrow indicator */}
        <View className="justify-center pr-4">
          <Text className="text-xl font-light" style={{ color: actionStyle.badgeText.color }}>
            →
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
