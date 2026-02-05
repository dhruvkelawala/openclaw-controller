import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Animated } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { tokens } from "../lib/design-tokens";
import { cn } from "../lib/cn";

interface ActionButtonsProps {
  onApprove: () => Promise<boolean>;
  onReject: () => Promise<boolean>;
  disabled?: boolean;
}

export function ActionButtons({ onApprove, onReject, disabled = false }: ActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Animation values
  const approveScale = useRef(new Animated.Value(1)).current;
  const rejectScale = useRef(new Animated.Value(1)).current;
  const approveGlow = useRef(new Animated.Value(0)).current;
  const rejectGlow = useRef(new Animated.Value(0)).current;

  const animatePress = (scale: Animated.Value, glow: Animated.Value) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const authenticateAndExecute = async (
    action: () => Promise<boolean>,
    actionName: string,
    scaleAnim: Animated.Value,
    glowAnim: Animated.Value
  ) => {
    animatePress(scaleAnim, glowAnim);
    setIsAuthenticating(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "CONFIRM ACTION",
          `Are you sure you want to ${actionName.toLowerCase()} this action?`,
          [
            { text: "CANCEL", style: "cancel" },
            {
              text: actionName.toUpperCase(),
              onPress: async () => {
                setIsLoading(true);
                await action();
                setIsLoading(false);
              },
            },
          ]
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `AUTHENTICATE TO ${actionName.toUpperCase()}`,
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticating(false);
        setIsLoading(true);
        const success = await action();
        if (!success) {
          Alert.alert(
            "ERROR",
            `Failed to ${actionName.toLowerCase()} the action. Please try again.`
          );
        }
        setIsLoading(false);
      }
    } catch {
      Alert.alert("ERROR", "Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading || isAuthenticating) {
    return (
      <View className="flex-row gap-3">
        <View
          className="flex-1 items-center py-6 rounded-sm border"
          style={{
            backgroundColor: tokens.colors.bg.secondary,
            borderColor: tokens.colors.border.default,
          }}
        >
          <ActivityIndicator color={tokens.colors.accent.cyan} size="large" />
          <Text
            className="text-xs font-bold tracking-wide mt-3"
            style={{ color: tokens.colors.text.secondary }}
          >
            {isAuthenticating ? "AUTHENTICATING..." : "PROCESSING..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      {/* Reject Button */}
      <Animated.View className="flex-1 relative" style={{ transform: [{ scale: rejectScale }] }}>
        <Animated.View
          className="absolute inset-0 rounded-sm"
          style={{
            opacity: rejectGlow,
            shadowColor: tokens.colors.accent.crimson,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: tokens.colors.accent.crimsonGlow,
          }}
        />
        <TouchableOpacity
          onPress={() => authenticateAndExecute(onReject, "REJECT", rejectScale, rejectGlow)}
          disabled={disabled}
          className={cn(
            "py-5 items-center justify-center rounded-sm border-2 relative overflow-hidden",
            disabled && "opacity-40"
          )}
          style={{
            backgroundColor: tokens.colors.bg.secondary,
            borderColor: tokens.colors.accent.crimson,
          }}
          activeOpacity={0.8}
        >
          <Text
            className="text-sm font-black tracking-[2px]"
            style={{ color: tokens.colors.accent.crimson }}
          >
            REJECT
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Approve Button */}
      <Animated.View className="flex-1 relative" style={{ transform: [{ scale: approveScale }] }}>
        <Animated.View
          className="absolute inset-0 rounded-sm"
          style={{
            opacity: approveGlow,
            shadowColor: tokens.colors.accent.lime,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: tokens.colors.accent.limeGlow,
          }}
        />
        <TouchableOpacity
          onPress={() => authenticateAndExecute(onApprove, "APPROVE", approveScale, approveGlow)}
          disabled={disabled}
          className={cn(
            "py-5 items-center justify-center rounded-sm border-2 relative overflow-hidden",
            disabled && "opacity-40"
          )}
          style={{
            backgroundColor: tokens.colors.bg.secondary,
            borderColor: tokens.colors.accent.lime,
          }}
          activeOpacity={0.8}
        >
          <Text
            className="text-sm font-black tracking-[2px]"
            style={{ color: tokens.colors.accent.lime }}
          >
            APPROVE
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
