import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useApprovals } from '../hooks/useApprovals';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { ApprovalCard } from '../components/ApprovalCard';
import { ApprovalAction } from '../types';

export default function PendingApprovalsScreen() {
  const { deviceToken, isLoading: authLoading, isRegistered } = useAuth();
  const { 
    pendingApprovals, 
    isLoading: approvalsLoading, 
    fetchPendingApprovals 
  } = useApprovals({ deviceToken });
  const { permissionStatus, requestPermissions } = usePushNotifications();
  const [refreshing, setRefreshing] = useState(false);

  // Check for notification permissions on first load
  useEffect(() => {
    if (permissionStatus === null) {
      requestPermissions();
    }
  }, [permissionStatus, requestPermissions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingApprovals();
    setRefreshing(false);
  };

  const handleApprovalPress = (approval: ApprovalAction) => {
    router.push(`/approval/${approval.id}`);
  };

  const navigateToHistory = () => {
    router.push('/history');
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const isLoading = authLoading || approvalsLoading;

  // Show welcome/setup state if not registered
  if (!isRegistered && !authLoading) {
    return (
      <View className="flex-1 bg-black px-6 justify-center items-center">
        <View className="w-20 h-20 bg-zinc-900 rounded-3xl items-center justify-center mb-6">
          <Text className="text-4xl">🦾</Text>
        </View>
        <Text className="text-white text-2xl font-bold mb-3 text-center">
          Welcome to OpenClaw
        </Text>
        <Text className="text-zinc-400 text-base text-center mb-8 leading-6">
          Your voice and remote approval companion.{'\n'}
          Get notified when actions need your approval.
        </Text>
        
        {!permissionStatus || permissionStatus !== 'granted' ? (
          <TouchableOpacity
            onPress={requestPermissions}
            className="bg-white rounded-xl py-4 px-8 w-full"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold text-base text-center">
              Enable Push Notifications
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="items-center">
            <View className="bg-green-500/20 rounded-full px-4 py-2 mb-4">
              <Text className="text-green-500 font-medium">Notifications enabled</Text>
            </View>
            <Text className="text-zinc-500 text-sm text-center">
              You're all set!{'\n'}
              Waiting for approval requests...
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header Stats */}
      <View className="flex-row px-4 pt-4 pb-2 gap-3">
        <View className="flex-1 bg-zinc-900 rounded-xl p-4">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide">Pending</Text>
          <Text className="text-white text-2xl font-bold mt-1">{pendingApprovals.length}</Text>
        </View>
        <TouchableOpacity 
          onPress={navigateToHistory}
          className="flex-1 bg-zinc-900 rounded-xl p-4"
          activeOpacity={0.7}
        >
          <Text className="text-zinc-500 text-xs uppercase tracking-wide">History</Text>
          <Text className="text-white text-2xl font-bold mt-1">View →</Text>
        </TouchableOpacity>
      </View>

      {/* Approvals List */}
      <FlatList
        data={pendingApprovals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <ApprovalCard approval={item} onPress={handleApprovalPress} />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center px-6 mt-20">
            <View className="w-16 h-16 bg-zinc-900 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">📭</Text>
            </View>
            <Text className="text-white text-lg font-semibold mb-2">
              No pending approvals
            </Text>
            <Text className="text-zinc-500 text-base text-center">
              When actions need your approval,{'\n'}they'll appear here.
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="mt-6 bg-zinc-900 rounded-xl py-3 px-6"
              activeOpacity={0.7}
            >
              <Text className="text-white font-medium">Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 border-t border-zinc-800 flex-row justify-around py-4 px-6">
        <TouchableOpacity className="items-center" activeOpacity={0.7}>
          <Text className="text-white text-2xl mb-1">📋</Text>
          <Text className="text-white text-xs font-medium">Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={navigateToHistory} activeOpacity={0.7}>
          <Text className="text-zinc-500 text-2xl mb-1">📜</Text>
          <Text className="text-zinc-500 text-xs">History</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={navigateToSettings} activeOpacity={0.7}>
          <Text className="text-zinc-500 text-2xl mb-1">⚙️</Text>
          <Text className="text-zinc-500 text-xs">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}