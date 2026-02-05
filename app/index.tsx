import React, { useEffect, useRef } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Animated } from "react-native";
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
      <View className="flex-1" style={{ backgroundColor: tokens.colors.bg.primary }}>
        <AnimatedBackground />
        <View className="flex-1 justify-center items-center px-8">
          <Animated.View style={{ transform: [{ scale: statsScale }] }}>
            <View
              className="w-20 h-20 justify-center items-center mb-8 rounded-sm border-2"
              style={{
                borderColor: tokens.colors.accent.cyan,
                shadowColor: tokens.colors.accent.cyan,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text className="text-4xl font-light" style={{ color: tokens.colors.accent.cyan }}>
                ◈
              </Text>
            </View>
          </Animated.View>

          <Text
            className="text-5xl font-black tracking-[8px]"
            style={{ color: tokens.colors.text.primary }}
          >
            OPENCLAW
          </Text>
          <Text
            className="text-lg font-bold tracking-[12px] mt-1"
            style={{ color: tokens.colors.accent.cyan }}
          >
            CONTROLLER
          </Text>

          <Text
            className="text-sm text-center mt-6 leading-6 tracking-wide"
            style={{ color: tokens.colors.text.secondary }}
          >
            High-security approval gateway for{"\n"}autonomous crypto operations
          </Text>

          {!permissionStatus || permissionStatus !== "granted" ? (
            <TouchableOpacity
              onPress={requestPermissions}
              className="mt-12 py-4 px-8 rounded-sm relative overflow-hidden"
              style={{ backgroundColor: tokens.colors.accent.cyan }}
              activeOpacity={0.8}
            >
              <Text
                className="text-sm font-black tracking-[2px]"
                style={{ color: tokens.colors.bg.primary }}
              >
                ENABLE NOTIFICATIONS
              </Text>
              <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20" />
            </TouchableOpacity>
          ) : (
            <View className="mt-12 items-center">
              <View
                className="w-3 h-3 rounded-full mb-4"
                style={{
                  backgroundColor: tokens.colors.accent.lime,
                  shadowColor: tokens.colors.accent.lime,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                }}
              />
              <Text
                className="text-base font-extrabold tracking-[4px]"
                style={{ color: tokens.colors.accent.lime }}
              >
                SYSTEM READY
              </Text>
              <Text
                className="text-sm mt-2 tracking-wide"
                style={{ color: tokens.colors.text.tertiary }}
              >
                Waiting for approval requests...
              </Text>
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
    <View className="flex-1" style={{ backgroundColor: tokens.colors.bg.primary }}>
      <AnimatedBackground />
      <ScanLines />

      {/* Header */}
      <Animated.View
        className="pt-16 px-5 pb-4 border-b"
        style={{
          backgroundColor: tokens.colors.bg.primary,
          borderBottomColor: tokens.colors.border.default,
          opacity: headerOpacity,
          transform: [{ translateY: headerSlide }],
        }}
      >
        <View className="flex-row justify-between items-start mb-5">
          <View>
            <Text
              className="text-[28px] font-black tracking-tight"
              style={{ color: tokens.colors.text.primary }}
            >
              PENDING
            </Text>
            <Text
              className="text-xs font-bold tracking-[4px] mt-1"
              style={{ color: tokens.colors.accent.cyan }}
            >
              APPROVAL QUEUE
            </Text>
          </View>
          <View
            className="flex-row items-center px-3 py-1.5 rounded-sm border"
            style={{
              backgroundColor: tokens.colors.bg.secondary,
              borderColor: tokens.colors.border.default,
            }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full mr-1.5"
              style={{
                backgroundColor: tokens.colors.accent.lime,
                shadowColor: tokens.colors.accent.lime,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
              }}
            />
            <Text
              className="text-[10px] font-extrabold tracking-wide"
              style={{ color: tokens.colors.text.secondary }}
            >
              LIVE
            </Text>
          </View>
        </View>

        {/* Stats */}
        <Animated.View className="flex-row gap-3" style={{ transform: [{ scale: statsScale }] }}>
          <View
            className="flex-1 items-center p-3 rounded-sm border"
            style={{
              backgroundColor: tokens.colors.bg.secondary,
              borderColor: tokens.colors.border.default,
            }}
          >
            <Text
              className="text-xl font-extrabold"
              style={{
                color: tokens.colors.text.primary,
                fontVariant: ["tabular-nums"],
              }}
            >
              {pendingApprovals.length}
            </Text>
            <Text
              className="text-[9px] font-bold tracking-wide mt-1"
              style={{ color: tokens.colors.text.tertiary }}
            >
              PENDING
            </Text>
          </View>
          <View
            className="flex-1 items-center p-3 rounded-sm border"
            style={{
              backgroundColor: tokens.colors.accent.crimsonGlow,
              borderColor: tokens.colors.accent.crimson,
            }}
          >
            <Text
              className="text-xl font-extrabold"
              style={{
                color: tokens.colors.text.primary,
                fontVariant: ["tabular-nums"],
              }}
            >
              {
                pendingApprovals.filter(
                  (a) => Date.now() > a.expiry - 60000 && Date.now() < a.expiry
                ).length
              }
            </Text>
            <Text
              className="text-[9px] font-bold tracking-wide mt-1"
              style={{ color: tokens.colors.accent.crimson }}
            >
              URGENT
            </Text>
          </View>
          <TouchableOpacity
            className="flex-1 items-center p-3 rounded-sm border"
            style={{
              backgroundColor: tokens.colors.bg.tertiary,
              borderColor: tokens.colors.border.default,
            }}
            onPress={navigateToHistory}
            activeOpacity={0.7}
          >
            <Text className="text-xl font-extrabold" style={{ color: tokens.colors.text.primary }}>
              HISTORY
            </Text>
            <Text
              className="text-[9px] font-bold tracking-wide mt-1"
              style={{ color: tokens.colors.text.tertiary }}
            >
              VIEW →
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Approvals List */}
      <FlatList
        data={pendingApprovals}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View className="px-4">
            <ApprovalCard approval={item} onPress={handleApprovalPress} index={index} />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={tokens.colors.accent.cyan}
            colors={[tokens.colors.accent.cyan]}
          />
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <View
              className="w-16 h-16 justify-center items-center rounded-full mb-6 border"
              style={{ borderColor: tokens.colors.border.default }}
            >
              <Text className="text-3xl" style={{ color: tokens.colors.text.muted }}>
                ◉
              </Text>
            </View>
            <Text
              className="text-lg font-extrabold tracking-[4px] mb-2"
              style={{ color: tokens.colors.text.secondary }}
            >
              QUEUE EMPTY
            </Text>
            <Text
              className="text-sm text-center leading-5"
              style={{ color: tokens.colors.text.tertiary }}
            >
              No pending approvals at this time{"\n"}
              Pull to refresh or wait for new requests
            </Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row py-3 pb-6 border-t"
        style={{
          backgroundColor: tokens.colors.bg.primary,
          borderTopColor: tokens.colors.border.default,
        }}
      >
        <TouchableOpacity className="flex-1 items-center" activeOpacity={0.7}>
          <Text
            className="text-xl mb-1"
            style={{
              color: tokens.colors.accent.cyan,
              textShadowColor: tokens.colors.accent.cyan,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }}
          >
            ◈
          </Text>
          <Text
            className="text-[10px] font-extrabold tracking-wide"
            style={{ color: tokens.colors.accent.cyan }}
          >
            QUEUE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center"
          onPress={navigateToHistory}
          activeOpacity={0.7}
        >
          <Text className="text-xl mb-1" style={{ color: tokens.colors.text.muted }}>
            ◉
          </Text>
          <Text
            className="text-[10px] font-bold tracking-wide"
            style={{ color: tokens.colors.text.muted }}
          >
            LOG
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center"
          onPress={navigateToSettings}
          activeOpacity={0.7}
        >
          <Text className="text-xl mb-1" style={{ color: tokens.colors.text.muted }}>
            ◎
          </Text>
          <Text
            className="text-[10px] font-bold tracking-wide"
            style={{ color: tokens.colors.text.muted }}
          >
            CONFIG
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
