import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { ApprovalAction } from "../schemas";
import { tokens } from "../lib/design-tokens";
import { getActionStyles } from "../lib/styles";

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
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(approval)}
        activeOpacity={0.8}
        style={[
          styles.container,
          isExpired && styles.expired,
          timeLeft < 60 && !isExpired && styles.urgent,
        ]}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: actionStyle.badgeText.color }]} />

        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.header}>
            <View style={styles.actionType}>
              <View style={[actionStyle.badge]}>
                <Text style={actionStyle.badgeText}>{approval.action}</Text>
              </View>
            </View>

            <Animated.View style={[styles.amount, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.amountText}>{approval.amount}</Text>
              <Text style={styles.coinText}>{approval.coin}</Text>
            </Animated.View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Footer row */}
          <View style={styles.footer}>
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>ID</Text>
              <Text style={styles.idValue}>{approval.id.slice(0, 12).toUpperCase()}...</Text>
            </View>

            <View style={styles.timeContainer}>
              {!isExpired ? (
                <>
                  <View
                    style={[
                      styles.timeDot,
                      {
                        backgroundColor:
                          timeLeft < 60 ? tokens.colors.accent.crimson : tokens.colors.accent.lime,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.timeText,
                      timeLeft < 60 && { color: tokens.colors.accent.crimson },
                    ]}
                  >
                    {minutesLeft.toString().padStart(2, "0")}:
                    {secondsLeft.toString().padStart(2, "0")}
                  </Text>
                </>
              ) : (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredText}>EXPIRED</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrow}>
          <Text style={[styles.arrowText, { color: actionStyle.badgeText.color }]}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  expired: {
    borderColor: tokens.colors.text.muted,
    opacity: 0.6,
  },
  urgent: {
    borderColor: tokens.colors.accent.crimson,
    shadowColor: tokens.colors.accent.crimson,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  accentBar: {
    width: 4,
    backgroundColor: tokens.colors.accent.cyan,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionType: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 24,
    fontWeight: "700",
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  coinText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.text.secondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border.default,
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  idLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.text.muted,
    letterSpacing: 1,
    marginRight: 8,
  },
  idValue: {
    fontSize: 11,
    fontWeight: "500",
    color: tokens.colors.text.tertiary,
    letterSpacing: 0.5,
    fontFamily: "monospace",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.text.secondary,
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.5,
  },
  expiredBadge: {
    backgroundColor: tokens.colors.text.muted,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  expiredText: {
    fontSize: 10,
    fontWeight: "800",
    color: tokens.colors.bg.primary,
    letterSpacing: 1,
  },
  arrow: {
    justifyContent: "center",
    paddingRight: 16,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: "300",
  },
});
