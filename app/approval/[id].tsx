import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Alert, Animated } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useApproveAction, useRejectAction } from "../../hooks/useApprovalsQuery";
import { useApprovalsStore } from "../../store/approvalsStore";
import { ActionButtons } from "../../components/ActionButtons";
import { AnimatedBackground, ScanLines } from "../../components/AnimatedBackground";
import { ApprovalAction } from "../../schemas";
import { tokens } from "../../lib/design-tokens";
import { getActionStyles } from "../../lib/styles";

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deviceToken } = useAuth();
  const { pendingApprovals, history } = useApprovalsStore();

  // React Query mutations
  const approveMutation = useApproveAction(deviceToken);
  const rejectMutation = useRejectAction(deviceToken);

  const [action, setAction] = useState<ApprovalAction | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const foundAction =
      pendingApprovals.find((a) => a.id === id) || history.find((a) => a.id === id);

    if (foundAction) {
      setAction(foundAction);
      setIsExpired(Date.now() > foundAction.expiry);
      setTimeLeft(Math.max(0, foundAction.expiry - Date.now()));

      // Entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          stiffness: 200,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          stiffness: 300,
          damping: 15,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Alert.alert("ERROR", "Approval not found");
      router.back();
    }
  }, [id, pendingApprovals, history]);

  // Countdown timer
  useEffect(() => {
    if (!action || isExpired) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, action.expiry - Date.now());
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);
    }, 100);

    return () => clearInterval(interval);
  }, [action, isExpired]);

  const handleApprove = async (): Promise<boolean> => {
    if (!deviceToken || !action) return false;

    try {
      await approveMutation.mutateAsync({ actionId: action.id });
      Alert.alert("APPROVED", "Action approved successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("ERROR", `Failed to approve: ${errorMessage}`);
      return false;
    }
  };

  const handleReject = async (): Promise<boolean> => {
    if (!deviceToken || !action) return false;

    try {
      await rejectMutation.mutateAsync({ actionId: action.id });
      Alert.alert("REJECTED", "Action rejected", [{ text: "OK", onPress: () => router.back() }]);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("ERROR", `Failed to reject: ${errorMessage}`);
      return false;
    }
  };

  // Check if any mutation is pending
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  if (!action) {
    return (
      <View className="flex-1" style={{ backgroundColor: tokens.colors.bg.primary }}>
        <AnimatedBackground />
        <View className="flex-1 justify-center items-center">
          <Text
            className="text-sm font-bold tracking-[4px]"
            style={{ color: tokens.colors.text.tertiary }}
          >
            LOADING...
          </Text>
        </View>
      </View>
    );
  }

  const minutesLeft = Math.floor(timeLeft / 60000);
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
  const msLeft = Math.floor((timeLeft % 1000) / 10);

  const actionStyle = getActionStyles(action.action);
  const isCompleted = action.status === "approved" || action.status === "rejected";
  const isUrgent = timeLeft < 60000 && !isExpired;

  const getStatusColor = () => {
    if (isCompleted) {
      return action.status === "approved"
        ? tokens.colors.accent.lime
        : tokens.colors.accent.crimson;
    }
    if (isExpired) return tokens.colors.text.muted;
    if (isUrgent) return tokens.colors.accent.crimson;
    return tokens.colors.accent.amber;
  };

  const getStatusBg = () => {
    if (isCompleted) {
      return action.status === "approved"
        ? tokens.colors.accent.limeGlow
        : tokens.colors.accent.crimsonGlow;
    }
    if (isExpired) return tokens.colors.bg.tertiary;
    if (isUrgent) return tokens.colors.accent.crimsonGlow;
    return tokens.colors.accent.amberGlow;
  };

  const getStatusBorderColor = () => {
    if (isCompleted) {
      return action.status === "approved"
        ? tokens.colors.accent.lime
        : tokens.colors.accent.crimson;
    }
    if (isExpired) return tokens.colors.text.muted;
    if (isUrgent) return tokens.colors.accent.crimson;
    return tokens.colors.accent.amber;
  };

  const getStatusText = () => {
    if (isCompleted) return action.status.toUpperCase();
    if (isExpired) return "EXPIRED";
    if (isUrgent) return "URGENT";
    return "PENDING";
  };

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.colors.bg.primary }}>
      <AnimatedBackground />
      <ScanLines />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          className="mb-8"
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text
            className="text-[11px] font-extrabold tracking-[3px] mb-2"
            style={{ color: tokens.colors.text.tertiary }}
          >
            APPROVAL DETAIL
          </Text>
          <View className="flex-row items-center">
            <Text
              className="text-sm font-semibold tracking-wide"
              style={{ color: tokens.colors.text.secondary, fontFamily: "monospace" }}
            >
              {action.id.slice(0, 16).toUpperCase()}
            </Text>
            <Text className="text-sm" style={{ color: tokens.colors.text.tertiary }}>
              ...
            </Text>
          </View>
        </Animated.View>

        {/* Action Icon */}
        <Animated.View
          className="items-center mb-8"
          style={{ opacity: fadeAnim, transform: [{ scale: iconScale }] }}
        >
          <Animated.View
            className="absolute w-[120px] h-[120px] rounded-full"
            style={{
              opacity: glowAnim,
              shadowColor: actionStyle.badgeText.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 40,
              elevation: 20,
            }}
          />
          <View
            className="w-[100px] h-[100px] justify-center items-center rounded-sm border-2"
            style={{
              borderColor: actionStyle.badgeText.color,
              backgroundColor: tokens.colors.bg.secondary,
            }}
          >
            <Text className="text-5xl font-light" style={{ color: actionStyle.badgeText.color }}>
              {actionStyle.badgeText.color === tokens.colors.accent.cyan
                ? "⇄"
                : actionStyle.badgeText.color === tokens.colors.accent.lime
                  ? "→"
                  : actionStyle.badgeText.color === tokens.colors.accent.crimson
                    ? "◈"
                    : actionStyle.badgeText.color === tokens.colors.accent.amber
                      ? "◉"
                      : "◎"}
            </Text>
          </View>
          <View
            className="mt-4 px-4 py-1.5 rounded-sm border"
            style={{
              borderColor: actionStyle.badgeText.color,
              backgroundColor: tokens.colors.bg.secondary,
            }}
          >
            <Text
              className="text-xs font-extrabold tracking-[2px]"
              style={{ color: actionStyle.badgeText.color }}
            >
              {action.action.toUpperCase()}
            </Text>
          </View>
        </Animated.View>

        {/* Amount Display */}
        <Animated.View
          className="items-center mb-8 p-6 rounded-sm border"
          style={{
            opacity: fadeAnim,
            backgroundColor: tokens.colors.bg.secondary,
            borderColor: tokens.colors.border.default,
          }}
        >
          <Text
            className="text-[10px] font-extrabold tracking-[3px] mb-3"
            style={{ color: tokens.colors.text.tertiary }}
          >
            AMOUNT
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="text-[42px] font-extrabold tracking-tight"
              style={{
                color: tokens.colors.text.primary,
                fontVariant: ["tabular-nums"],
              }}
            >
              {action.amount}
            </Text>
            <Text
              className="text-lg font-bold ml-2 tracking-wide"
              style={{ color: tokens.colors.accent.cyan }}
            >
              {action.coin}
            </Text>
          </View>
        </Animated.View>

        {/* Details Grid */}
        <Animated.View
          className="p-5 rounded-sm border"
          style={{
            opacity: fadeAnim,
            backgroundColor: tokens.colors.bg.secondary,
            borderColor: tokens.colors.border.default,
          }}
        >
          <View className="flex-row justify-between items-center py-3">
            <Text
              className="text-[11px] font-bold tracking-[2px]"
              style={{ color: tokens.colors.text.tertiary }}
            >
              STATUS
            </Text>
            <View
              className="px-3 py-1 rounded-sm border"
              style={{
                backgroundColor: getStatusBg(),
                borderColor: getStatusBorderColor(),
              }}
            >
              <Text
                className="text-[10px] font-extrabold tracking-wide"
                style={{ color: getStatusColor() }}
              >
                {getStatusText()}
              </Text>
            </View>
          </View>

          <View className="h-px my-0" style={{ backgroundColor: tokens.colors.border.default }} />

          <View className="flex-row justify-between items-center py-3">
            <Text
              className="text-[11px] font-bold tracking-[2px]"
              style={{ color: tokens.colors.text.tertiary }}
            >
              EXPIRES IN
            </Text>
            {!isExpired && !isCompleted ? (
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor: isUrgent
                      ? tokens.colors.accent.crimson
                      : tokens.colors.accent.lime,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 5,
                  }}
                />
                <Text
                  className="text-xl font-bold tracking-[2px]"
                  style={{
                    color: isUrgent ? tokens.colors.accent.crimson : tokens.colors.text.primary,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {minutesLeft.toString().padStart(2, "0")}:
                  {secondsLeft.toString().padStart(2, "0")}.{msLeft.toString().padStart(2, "0")}
                </Text>
              </View>
            ) : (
              <Text
                className="text-xl font-bold tracking-[2px]"
                style={{
                  color: tokens.colors.text.muted,
                  fontVariant: ["tabular-nums"],
                }}
              >
                --:--.--
              </Text>
            )}
          </View>

          <View className="h-px my-0" style={{ backgroundColor: tokens.colors.border.default }} />

          <View className="flex-row justify-between items-center py-3">
            <Text
              className="text-[11px] font-bold tracking-[2px]"
              style={{ color: tokens.colors.text.tertiary }}
            >
              TIMESTAMP
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{
                color: tokens.colors.text.secondary,
                fontVariant: ["tabular-nums"],
              }}
            >
              {new Date(action.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </Text>
          </View>
        </Animated.View>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Action Buttons */}
      {!isCompleted && !isExpired && (
        <Animated.View
          className="absolute bottom-0 left-0 right-0 p-5 pb-8 border-t"
          style={{
            opacity: fadeAnim,
            backgroundColor: tokens.colors.bg.primary,
            borderTopColor: tokens.colors.border.default,
          }}
        >
          <ActionButtons
            onApprove={handleApprove}
            onReject={handleReject}
            disabled={isProcessing}
          />
          <Text
            className="text-center text-[10px] font-bold tracking-[2px] mt-4"
            style={{ color: tokens.colors.text.tertiary }}
          >
            BIOMETRIC AUTHENTICATION REQUIRED
          </Text>
        </Animated.View>
      )}

      {isCompleted && (
        <View
          className="absolute bottom-0 left-0 right-0 p-5 pb-8 border-t"
          style={{
            backgroundColor: tokens.colors.bg.primary,
            borderTopColor: tokens.colors.border.default,
          }}
        >
          <View
            className="py-5 items-center rounded-sm border-2"
            style={{
              backgroundColor: tokens.colors.bg.secondary,
              borderColor:
                action.status === "approved"
                  ? tokens.colors.accent.lime
                  : tokens.colors.accent.crimson,
            }}
          >
            <Text
              className="text-base font-black tracking-[4px]"
              style={{
                color:
                  action.status === "approved"
                    ? tokens.colors.accent.lime
                    : tokens.colors.accent.crimson,
              }}
            >
              {action.status.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
