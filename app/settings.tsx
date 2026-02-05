import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useRegisterDevice } from "../hooks/useApprovalsQuery";
import { useApprovalsStore } from "../store/approvalsStore";

export default function SettingsScreen() {
  const { deviceToken, isRegistered } = useAuth();
  const { sendTestNotification, permissionStatus, requestPermissions } = usePushNotifications();
  const registerDeviceMutation = useRegisterDevice(deviceToken);
  const { clearHistory } = useApprovalsStore();

  const handleTestNotification = async () => {
    if (permissionStatus !== "granted") {
      Alert.alert("Permissions Required", "Please enable push notifications to test.", [
        { text: "Cancel", style: "cancel" },
        { text: "Enable", onPress: requestPermissions },
      ]);
      return;
    }

    await sendTestNotification();
    Alert.alert("Test Sent", "Check your notifications!");
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearHistory();
            Alert.alert("History Cleared", "All history has been removed.");
          },
        },
      ]
    );
  };

  const handleReRegister = async () => {
    Alert.alert(
      "Re-register Device",
      "This will re-register your device with the OpenClaw backend.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Re-register",
          onPress: async () => {
            try {
              await registerDeviceMutation.mutateAsync({});
              Alert.alert("Success", "Device re-registered successfully");
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown error";
              Alert.alert("Error", `Failed to re-register device: ${message}`);
            }
          },
        },
      ]
    );
  };

  const handleViewDeviceToken = () => {
    Alert.alert(
      "Device Token",
      deviceToken
        ? `${deviceToken.substring(0, 16)}...\n\n(Truncated for security)`
        : "No token found",
      [{ text: "OK" }]
    );
  };

  const navigateToPending = () => {
    router.push("/");
  };

  const navigateToHistory = () => {
    router.push("/history");
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* App Info */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-zinc-900 rounded-3xl items-center justify-center mb-4">
            <Text className="text-4xl">🦾</Text>
          </View>
          <Text className="text-white text-xl font-bold">OpenClaw Controller</Text>
          <Text className="text-zinc-500 text-sm mt-1">Version 1.0.0</Text>
        </View>

        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">
            Notifications
          </Text>
          <View className="bg-zinc-900 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={requestPermissions}
              className="flex-row justify-between items-center p-4 border-b border-zinc-800"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base">Push Notifications</Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  permissionStatus === "granted" ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <Text
                  className={`text-sm ${
                    permissionStatus === "granted" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {permissionStatus === "granted" ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTestNotification}
              className="flex-row justify-between items-center p-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base">Send Test Notification</Text>
              <Text className="text-zinc-500">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Section */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">Device</Text>
          <View className="bg-zinc-900 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={handleViewDeviceToken}
              className="flex-row justify-between items-center p-4 border-b border-zinc-800"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base">Device Token</Text>
              <Text className="text-zinc-500 text-sm font-mono">
                {deviceToken ? `${deviceToken.substring(0, 8)}...` : "None"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReRegister}
              disabled={registerDeviceMutation.isPending}
              className="flex-row justify-between items-center p-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base">Re-register Device</Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  isRegistered ? "bg-green-500/20" : "bg-yellow-500/20"
                }`}
              >
                <Text className={`text-sm ${isRegistered ? "text-green-500" : "text-yellow-500"}`}>
                  {registerDeviceMutation.isPending
                    ? "Registering..."
                    : isRegistered
                      ? "Active"
                      : "Inactive"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">Data</Text>
          <View className="bg-zinc-900 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={handleClearHistory}
              className="flex-row justify-between items-center p-4"
              activeOpacity={0.7}
            >
              <Text className="text-red-500 text-base">Clear History</Text>
              <Text className="text-zinc-500">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">About</Text>
          <View className="bg-zinc-900 rounded-xl p-4">
            <Text className="text-zinc-400 text-sm leading-5">
              OpenClaw Controller is your voice and remote approval companion. Receive push
              notifications for actions requiring approval and securely approve or reject them with
              biometric authentication.
            </Text>
          </View>
        </View>

        {/* Spacer for bottom nav */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 border-t border-zinc-800 flex-row justify-around py-4 px-6">
        <TouchableOpacity className="items-center" onPress={navigateToPending} activeOpacity={0.7}>
          <Text className="text-zinc-500 text-2xl mb-1">📋</Text>
          <Text className="text-zinc-500 text-xs">Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={navigateToHistory} activeOpacity={0.7}>
          <Text className="text-zinc-500 text-2xl mb-1">📜</Text>
          <Text className="text-zinc-500 text-xs">History</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" activeOpacity={0.7}>
          <Text className="text-white text-2xl mb-1">⚙️</Text>
          <Text className="text-white text-xs font-medium">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
