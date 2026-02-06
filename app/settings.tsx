import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useApprovalsStore } from '../store/approvalsStore';
import { BottomNav } from '../components/BottomNav';

export default function SettingsScreen() {
  const { deviceToken, reRegister, isRegistered } = useAuth();
  // Push notifications disabled for local testing without Apple Developer Program
  // const { sendTestNotification, permissionStatus, requestPermissions } =
  //   usePushNotifications();
  const permissionStatus = 'denied' as const;
  const requestPermissions = async () => false;
  const sendTestNotification = async () => {};
  const { clearHistory } = useApprovalsStore();

  const handleTestNotification = async () => {
    Alert.alert(
      'Notifications Disabled',
      'Push notifications are disabled for local testing without Apple Developer Program.',
      [{ text: 'OK' }]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Alert.alert('History Cleared', 'All history has been removed.');
          },
        },
      ]
    );
  };

  const handleReRegister = async () => {
    Alert.alert(
      'Re-register Device',
      'This will re-register your device with the OpenClaw backend.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Re-register',
          onPress: async () => {
            const success = await reRegister();
            if (success) {
              Alert.alert('Success', 'Device re-registered successfully');
            } else {
              Alert.alert('Error', 'Failed to re-register device');
            }
          },
        },
      ]
    );
  };

  const handleViewDeviceToken = () => {
    Alert.alert(
      'Device Token',
      deviceToken
        ? `${deviceToken.substring(0, 16)}...\n\n(Truncated for security)`
        : 'No token found',
      [{ text: 'OK' }]
    );
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

        {/* Notifications Section - Disabled for local testing */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">
            Notifications
          </Text>
          <View className="bg-zinc-900 rounded-xl overflow-hidden">
            <View
              className="flex-row justify-between items-center p-4 border-b border-zinc-800"
            >
              <Text className="text-white text-base">Push Notifications</Text>
              <View className="px-3 py-1 rounded-full bg-yellow-500/20">
                <Text className="text-sm text-yellow-500">Disabled</Text>
              </View>
            </View>

            <View className="p-4">
              <Text className="text-zinc-400 text-sm">
                Push notifications are disabled for local UX testing without Apple Developer Program.
                Pull down on the main screen to refresh for new approvals.
              </Text>
            </View>
          </View>
        </View>

        {/* Device Section */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">
            Device
          </Text>
          <View className="bg-zinc-900 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={handleViewDeviceToken}
              className="flex-row justify-between items-center p-4 border-b border-zinc-800"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base">Device Token</Text>
              <Text className="text-zinc-500 text-sm font-mono">
                {deviceToken ? `${deviceToken.substring(0, 8)}...` : 'None'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReRegister}
              className="flex-row justify-between items-center p-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base">Re-register Device</Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  isRegistered ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}
              >
                <Text
                  className={`text-sm ${
                    isRegistered ? 'text-green-500' : 'text-yellow-500'
                  }`}
                >
                  {isRegistered ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View className="mb-6">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">
            Data
          </Text>
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
          <Text className="text-zinc-500 text-xs uppercase tracking-wide mb-3 ml-1">
            About
          </Text>
          <View className="bg-zinc-900 rounded-xl p-4">
            <Text className="text-zinc-400 text-sm leading-5">
              OpenClaw Controller is your voice and remote approval companion.
              Receive push notifications for actions requiring approval and
              securely approve or reject them with biometric authentication.
            </Text>
          </View>
        </View>

        {/* Spacer for bottom nav */}
        <View className="h-24" />
      </ScrollView>

      <BottomNav />
    </View>
  );
}
