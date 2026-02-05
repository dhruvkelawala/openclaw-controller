import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Alert, Animated, StyleSheet } from "react-native";
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
      <View style={styles.screen}>
        <AnimatedBackground />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>LOADING...</Text>
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

  return (
    <View style={styles.screen}>
      <AnimatedBackground />
      <ScanLines />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerLabel}>APPROVAL DETAIL</Text>
          <View style={styles.idContainer}>
            <Text style={styles.idValue}>{action.id.slice(0, 16).toUpperCase()}</Text>
            <Text style={styles.idEllipsis}>...</Text>
          </View>
        </Animated.View>

        {/* Action Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconGlow,
              {
                opacity: glowAnim,
                shadowColor: actionStyle.badgeText.color,
              },
            ]}
          />
          <View style={[styles.iconBox, { borderColor: actionStyle.badgeText.color }]}>
            <Text style={[styles.iconText, { color: actionStyle.badgeText.color }]}>
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
          <View style={[styles.actionBadge, { borderColor: actionStyle.badgeText.color }]}>
            <Text style={[styles.actionBadgeText, { color: actionStyle.badgeText.color }]}>
              {action.action.toUpperCase()}
            </Text>
          </View>
        </Animated.View>

        {/* Amount Display */}
        <Animated.View style={[styles.amountContainer, { opacity: fadeAnim }]}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountValue}>{action.amount}</Text>
            <Text style={styles.amountCoin}>{action.coin}</Text>
          </View>
        </Animated.View>

        {/* Details Grid */}
        <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>STATUS</Text>
            <View
              style={[
                styles.statusBadge,
                isCompleted
                  ? action.status === "approved"
                    ? styles.statusApproved
                    : styles.statusRejected
                  : isExpired
                    ? styles.statusExpired
                    : isUrgent
                      ? styles.statusUrgent
                      : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isCompleted
                    ? action.status === "approved"
                      ? { color: tokens.colors.accent.lime }
                      : { color: tokens.colors.accent.crimson }
                    : isExpired
                      ? { color: tokens.colors.text.muted }
                      : isUrgent
                        ? { color: tokens.colors.accent.crimson }
                        : { color: tokens.colors.accent.amber },
                ]}
              >
                {isCompleted
                  ? action.status.toUpperCase()
                  : isExpired
                    ? "EXPIRED"
                    : isUrgent
                      ? "URGENT"
                      : "PENDING"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>EXPIRES IN</Text>
            {!isExpired && !isCompleted ? (
              <View style={styles.timerContainer}>
                <View
                  style={[
                    styles.timerDot,
                    {
                      backgroundColor: isUrgent
                        ? tokens.colors.accent.crimson
                        : tokens.colors.accent.lime,
                    },
                  ]}
                />
                <Text
                  style={[styles.timerValue, isUrgent && { color: tokens.colors.accent.crimson }]}
                >
                  {minutesLeft.toString().padStart(2, "0")}:
                  {secondsLeft.toString().padStart(2, "0")}.{msLeft.toString().padStart(2, "0")}
                </Text>
              </View>
            ) : (
              <Text style={styles.expiredValue}>--:--.--</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>TIMESTAMP</Text>
            <Text style={styles.detailValue}>
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
        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons */}
      {!isCompleted && !isExpired && (
        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          <ActionButtons
            onApprove={handleApprove}
            onReject={handleReject}
            disabled={isProcessing}
          />
          <Text style={styles.authNote}>BIOMETRIC AUTHENTICATION REQUIRED</Text>
        </Animated.View>
      )}

      {isCompleted && (
        <View style={styles.completedContainer}>
          <View
            style={[
              styles.completedBox,
              action.status === "approved"
                ? { borderColor: tokens.colors.accent.lime }
                : { borderColor: tokens.colors.accent.crimson },
            ]}
          >
            <Text
              style={[
                styles.completedText,
                action.status === "approved"
                  ? { color: tokens.colors.accent.lime }
                  : { color: tokens.colors.accent.crimson },
              ]}
            >
              {action.status.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 4,
    color: tokens.colors.text.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  header: {
    marginBottom: 32,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    color: tokens.colors.text.tertiary,
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  idValue: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.text.secondary,
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  idEllipsis: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: tokens.colors.bg.secondary,
  },
  iconText: {
    fontSize: 48,
    fontWeight: "300",
  },
  actionBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: tokens.colors.bg.secondary,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 2,
    padding: 24,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    color: tokens.colors.text.tertiary,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  amountValue: {
    fontSize: 42,
    fontWeight: "800",
    color: tokens.colors.text.primary,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  amountCoin: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.accent.cyan,
    marginLeft: 8,
    letterSpacing: 1,
  },
  detailsContainer: {
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 2,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: tokens.colors.text.tertiary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.text.secondary,
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border.default,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: tokens.colors.accent.amberGlow,
    borderColor: tokens.colors.accent.amber,
  },
  statusApproved: {
    backgroundColor: tokens.colors.accent.limeGlow,
    borderColor: tokens.colors.accent.lime,
  },
  statusRejected: {
    backgroundColor: tokens.colors.accent.crimsonGlow,
    borderColor: tokens.colors.accent.crimson,
  },
  statusExpired: {
    backgroundColor: tokens.colors.bg.tertiary,
    borderColor: tokens.colors.text.muted,
  },
  statusUrgent: {
    backgroundColor: tokens.colors.accent.crimsonGlow,
    borderColor: tokens.colors.accent.crimson,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  expiredValue: {
    fontSize: 20,
    fontWeight: "700",
    color: tokens.colors.text.muted,
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  spacer: {
    height: 32,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.default,
    padding: 20,
    paddingBottom: 32,
  },
  authNote: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: tokens.colors.text.tertiary,
    marginTop: 16,
  },
  completedContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.default,
    padding: 20,
    paddingBottom: 32,
  },
  completedBox: {
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 2,
    borderRadius: 2,
    paddingVertical: 20,
    alignItems: "center",
  },
  completedText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
  },
});
