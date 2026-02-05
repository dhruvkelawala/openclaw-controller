import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useApprovals } from '../../hooks/useApprovals';
import { useApprovalsStore } from '../../store/approvalsStore';
import { ActionButtons } from '../../components/ActionButtons';
import { ApprovalAction } from '../../types';

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deviceToken } = useAuth();
  const { approveAction, rejectAction } = useApprovals({ deviceToken });
  const { pendingApprovals, history } = useApprovalsStore();
  
  const [action, setAction] = useState<ApprovalAction | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Find action in pending or history
    const foundAction = pendingApprovals.find(a => a.id === id) || 
                        history.find(a => a.id === id);
    
    if (foundAction) {
      setAction(foundAction);
      setIsExpired(Date.now() > foundAction.expiry);
    } else {
      // Action not found, go back
      Alert.alert('Error', 'Approval not found');
      router.back();
    }
  }, [id, pendingApprovals, history]);

  // Check expiry every second
  useEffect(() => {
    if (!action) return;
    
    const interval = setInterval(() => {
      const expired = Date.now() > action.expiry;
      setIsExpired(expired);
    }, 1000);

    return () => clearInterval(interval);
  }, [action]);

  const handleApprove = async (): Promise<boolean> => {
    if (!deviceToken || !action) return false;
    
    const success = await approveAction(action.id);
    if (success) {
      Alert.alert('Success', 'Action approved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
    return success;
  };

  const handleReject = async (): Promise<boolean> => {
    if (!deviceToken || !action) return false;
    
    const success = await rejectAction(action.id);
    if (success) {
      Alert.alert('Rejected', 'Action rejected', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
    return success;
  };

  if (!action) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-zinc-500">Loading...</Text>
      </View>
    );
  }

  const timeLeft = Math.max(0, Math.floor((action.expiry - Date.now()) / 1000));
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  const getActionColor = () => {
    switch (action.action) {
      case 'swap': return 'text-blue-400';
      case 'transfer': return 'text-green-400';
      case 'trade': return 'text-purple-400';
      case 'stake': return 'text-yellow-400';
      case 'unstake': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const isCompleted = action.status === 'approved' || action.status === 'rejected';

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Action Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-zinc-900 rounded-3xl items-center justify-center mb-4">
            <Text className="text-5xl">
              {action.action === 'swap' ? '⇄' : 
               action.action === 'transfer' ? '→' :
               action.action === 'trade' ? '⚡' :
               action.action === 'stake' ? '🔒' :
               action.action === 'unstake' ? '🔓' : '⋯'}
            </Text>
          </View>
          <Text className={`text-2xl font-bold ${getActionColor()}`}>
            {action.action.charAt(0).toUpperCase() + action.action.slice(1)}
          </Text>
          <Text className="text-zinc-500 text-base mt-1">{action.coin}</Text>
        </View>

        {/* Details Card */}
        <View className="bg-zinc-900 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-between items-center py-3 border-b border-zinc-800">
            <Text className="text-zinc-500 text-base">Amount</Text>
            <Text className="text-white text-lg font-semibold">{action.amount}</Text>
          </View>
          
          <View className="flex-row justify-between items-center py-3 border-b border-zinc-800">
            <Text className="text-zinc-500 text-base">Coin/Asset</Text>
            <Text className="text-white text-lg font-semibold">{action.coin}</Text>
          </View>
          
          <View className="flex-row justify-between items-center py-3 border-b border-zinc-800">
            <Text className="text-zinc-500 text-base">Action ID</Text>
            <Text className="text-zinc-400 text-sm font-mono" numberOfLines={1}>
              {action.id.slice(0, 12)}...
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-zinc-500 text-base">Status</Text>
            <View className={`px-3 py-1 rounded-full ${
              isCompleted 
                ? action.status === 'approved' 
                  ? 'bg-green-500/20' 
                  : 'bg-red-500/20'
                : isExpired 
                  ? 'bg-red-500/20' 
                  : 'bg-yellow-500/20'
            }`}>
              <Text className={`text-sm font-medium ${
                isCompleted
                  ? action.status === 'approved'
                    ? 'text-green-500'
                    : 'text-red-500'
                  : isExpired
                    ? 'text-red-500'
                    : 'text-yellow-500'
              }`}>
                {isCompleted 
                  ? action.status.charAt(0).toUpperCase() + action.status.slice(1)
                  : isExpired ? 'Expired' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Timer */}
        {!isCompleted && !isExpired && (
          <View className="bg-zinc-900/50 rounded-xl p-4 mb-6 items-center">
            <Text className="text-zinc-500 text-sm mb-1">Time remaining</Text>
            <Text className="text-white text-3xl font-mono font-bold">
              {minutesLeft.toString().padStart(2, '0')}:{secondsLeft.toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {isExpired && !isCompleted && (
          <View className="bg-red-500/10 rounded-xl p-4 mb-6 items-center border border-red-500/30">
            <Text className="text-red-500 font-semibold">This action has expired</Text>
            <Text className="text-red-400/70 text-sm mt-1">
              You can no longer approve or reject this action
            </Text>
          </View>
        )}

        {/* Spacer for buttons */}
        <View className="h-8" />
      </ScrollView>

      {/* Action Buttons */}
      {!isCompleted && !isExpired && (
        <View className="px-6 pb-8 pt-4 bg-black border-t border-zinc-800">
          <ActionButtons
            onApprove={handleApprove}
            onReject={handleReject}
          />
          <Text className="text-zinc-600 text-xs text-center mt-4">
            Authentication required to approve or reject
          </Text>
        </View>
      )}

      {isCompleted && (
        <View className="px-6 pb-8 pt-4 bg-black border-t border-zinc-800">
          <View className="bg-zinc-900 rounded-xl py-4 items-center">
            <Text className="text-zinc-500">
              This action has been {action.status}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}