import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { tokens } from "../lib/design-tokens";

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
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={tokens.colors.accent.cyan} size="large" />
          <Text style={styles.loadingText}>
            {isAuthenticating ? "AUTHENTICATING..." : "PROCESSING..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Reject Button */}
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: rejectScale }] }]}>
        <Animated.View
          style={[
            styles.glowOverlay,
            styles.rejectGlow,
            {
              opacity: rejectGlow,
              shadowColor: tokens.colors.accent.crimson,
            },
          ]}
        />
        <TouchableOpacity
          onPress={() => authenticateAndExecute(onReject, "REJECT", rejectScale, rejectGlow)}
          disabled={disabled}
          style={[styles.button, styles.rejectButton, disabled && styles.disabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectText}>REJECT</Text>
          <View style={styles.buttonLine} />
        </TouchableOpacity>
      </Animated.View>

      {/* Approve Button */}
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: approveScale }] }]}>
        <Animated.View
          style={[
            styles.glowOverlay,
            styles.approveGlow,
            {
              opacity: approveGlow,
              shadowColor: tokens.colors.accent.lime,
            },
          ]}
        />
        <TouchableOpacity
          onPress={() => authenticateAndExecute(onApprove, "APPROVE", approveScale, approveGlow)}
          disabled={disabled}
          style={[styles.button, styles.approveButton, disabled && styles.disabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.approveText}>APPROVE</Text>
          <View style={styles.buttonLine} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
    position: "relative",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  approveGlow: {
    backgroundColor: tokens.colors.accent.limeGlow,
  },
  rejectGlow: {
    backgroundColor: tokens.colors.accent.crimsonGlow,
  },
  button: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
  },
  approveButton: {
    backgroundColor: tokens.colors.bg.secondary,
    borderColor: tokens.colors.accent.lime,
  },
  rejectButton: {
    backgroundColor: tokens.colors.bg.secondary,
    borderColor: tokens.colors.accent.crimson,
  },
  disabled: {
    opacity: 0.4,
  },
  approveText: {
    color: tokens.colors.accent.lime,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  rejectText: {
    color: tokens.colors.accent.crimson,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  buttonLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  loadingContainer: {
    flexDirection: "row",
    gap: 12,
  },
  loadingBox: {
    flex: 1,
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 2,
    paddingVertical: 24,
    alignItems: "center",
  },
  loadingText: {
    color: tokens.colors.text.secondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 12,
  },
});
