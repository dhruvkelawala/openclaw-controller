import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { usePendingApprovals } from "../hooks/useApprovalsQuery";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { ApprovalCard } from "../components/ApprovalCard";
import { AnimatedBackground, ScanLines } from "../components/AnimatedBackground";
import { ApprovalAction } from "../schemas";
import { tokens } from "../lib/design-tokens";
export default function PendingApprovalsScreen() {
  const { deviceToken, isLoading: authLoading, isRegistered } = useAuth();
  const {
    data: pendingApprovals = [],
    isRefetching,
    refetch,
    error: approvalsError,
  } = usePendingApprovals(deviceToken);
  const { permissionStatus, requestPermissions } = usePushNotifications();

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const statsScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (permissionStatus === null) {
      requestPermissions();
    }
  }, [permissionStatus, requestPermissions]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        stiffness: 200,
        damping: 20,
        useNativeDriver: true,
      }),
      Animated.spring(statsScale, {
        toValue: 1,
        stiffness: 200,
        damping: 20,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    await refetch();
  };

  const handleApprovalPress = (approval: ApprovalAction) => {
    router.push(`/approval/${approval.id}`);
  };

  const navigateToHistory = () => router.push("/history");
  const navigateToSettings = () => router.push("/settings");

  // Show welcome/setup state
  if (!isRegistered && !authLoading) {
    return (
      <View style={styles.screen}>
        <AnimatedBackground />
        <View style={styles.welcomeContainer}>
          <Animated.View style={{ transform: [{ scale: statsScale }] }}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>◈</Text>
            </View>
          </Animated.View>

          <Text style={styles.welcomeTitle}>OPENCLAW</Text>
          <Text style={styles.welcomeSubtitle}>CONTROLLER</Text>

          <Text style={styles.welcomeDescription}>
            High-security approval gateway for{"\n"}autonomous crypto operations
          </Text>

          {!permissionStatus || permissionStatus !== "granted" ? (
            <TouchableOpacity
              onPress={requestPermissions}
              style={styles.enableButton}
              activeOpacity={0.8}
            >
              <Text style={styles.enableButtonText}>ENABLE NOTIFICATIONS</Text>
              <View style={styles.buttonAccent} />
            </TouchableOpacity>
          ) : (
            <View style={styles.readyContainer}>
              <View style={styles.readyDot} />
              <Text style={styles.readyText}>SYSTEM READY</Text>
              <Text style={styles.waitingText}>Waiting for approval requests...</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Show error state
  if (approvalsError) {
    console.error("Approvals error:", approvalsError);
  }

  return (
    <View style={styles.screen}>
      <AnimatedBackground />
      <ScanLines />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>PENDING</Text>
            <Text style={styles.headerSubtitle}>APPROVAL QUEUE</Text>
          </View>
          <View style={styles.connectionStatus}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>LIVE</Text>
          </View>
        </View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { transform: [{ scale: statsScale }] }]}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pendingApprovals.length}</Text>
            <Text style={styles.statLabel}>PENDING</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statValue}>
              {
                pendingApprovals.filter(
                  (a) => Date.now() > a.expiry - 60000 && Date.now() < a.expiry
                ).length
              }
            </Text>
            <Text style={[styles.statLabel, { color: tokens.colors.accent.crimson }]}>URGENT</Text>
          </View>
          <TouchableOpacity
            style={[styles.statBox, styles.statBoxClickable]}
            onPress={navigateToHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>HISTORY</Text>
            <Text style={styles.statLabel}>VIEW →</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Approvals List */}
      <FlatList
        data={pendingApprovals}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <ApprovalCard approval={item} onPress={handleApprovalPress} index={index} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={tokens.colors.accent.cyan}
            colors={[tokens.colors.accent.cyan]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>◉</Text>
            </View>
            <Text style={styles.emptyTitle}>QUEUE EMPTY</Text>
            <Text style={styles.emptyDescription}>
              No pending approvals at this time{"\n"}
              Pull to refresh or wait for new requests
            </Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive} activeOpacity={0.7}>
          <Text style={styles.navIconActive}>◈</Text>
          <Text style={styles.navLabelActive}>QUEUE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={navigateToHistory} activeOpacity={0.7}>
          <Text style={styles.navIcon}>◉</Text>
          <Text style={styles.navLabel}>LOG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={navigateToSettings} activeOpacity={0.7}>
          <Text style={styles.navIcon}>◎</Text>
          <Text style={styles.navLabel}>CONFIG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.bg.primary,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: tokens.colors.accent.cyan,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: tokens.colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 40,
    color: tokens.colors.accent.cyan,
    fontWeight: "300",
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 8,
    color: tokens.colors.text.primary,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 12,
    color: tokens.colors.accent.cyan,
    marginTop: 4,
  },
  welcomeDescription: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  enableButton: {
    marginTop: 48,
    backgroundColor: tokens.colors.accent.cyan,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 2,
    position: "relative",
    overflow: "hidden",
  },
  enableButtonText: {
    color: tokens.colors.bg.primary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  buttonAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  readyContainer: {
    marginTop: 48,
    alignItems: "center",
  },
  readyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: tokens.colors.accent.lime,
    shadowColor: tokens.colors.accent.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    marginBottom: 16,
  },
  readyText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 4,
    color: tokens.colors.accent.lime,
  },
  waitingText: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: tokens.colors.bg.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.default,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    color: tokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
    color: tokens.colors.accent.cyan,
    marginTop: 4,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.bg.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.accent.lime,
    marginRight: 6,
    shadowColor: tokens.colors.accent.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: tokens.colors.bg.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 2,
    padding: 12,
    alignItems: "center",
  },
  statBoxMiddle: {
    borderColor: tokens.colors.accent.crimson,
    backgroundColor: tokens.colors.accent.crimsonGlow,
  },
  statBoxClickable: {
    backgroundColor: tokens.colors.bg.tertiary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.text.primary,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: tokens.colors.text.tertiary,
    marginTop: 4,
  },
  cardContainer: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 28,
    color: tokens.colors.text.muted,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
    color: tokens.colors.text.secondary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: tokens.colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.default,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navItemActive: {
    flex: 1,
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    color: tokens.colors.text.muted,
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 20,
    color: tokens.colors.accent.cyan,
    marginBottom: 4,
    textShadowColor: tokens.colors.accent.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: tokens.colors.text.muted,
  },
  navLabelActive: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.accent.cyan,
  },
});
