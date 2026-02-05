import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ApprovalAction } from '../types';
import { cn } from '../lib/cn';

interface ApprovalCardProps {
  approval: ApprovalAction;
  onPress: (approval: ApprovalAction) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ApprovalCard({ approval, onPress }: ApprovalCardProps) {
  const isExpired = Date.now() > approval.expiry;
  const timeLeft = Math.max(0, Math.floor((approval.expiry - Date.now()) / 1000));
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getActionColor = () => {
    switch (approval.action) {
      case 'swap':
        return 'text-blue-400';
      case 'transfer':
        return 'text-green-400';
      case 'trade':
        return 'text-purple-400';
      case 'stake':
        return 'text-yellow-400';
      case 'unstake':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getActionIcon = () => {
    switch (approval.action) {
      case 'swap':
        return '⇄';
      case 'transfer':
        return '→';
      case 'trade':
        return '⚡';
      case 'stake':
        return '🔒';
      case 'unstake':
        return '🔓';
      default:
        return '⋯';
    }
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(220)}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress(approval);
      }}
      onPressIn={() => {
        scale.value = withSpring(0.98, { stiffness: 300, damping: 18 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 18 });
      }}
      style={animatedStyle}
      className={cn(
        'bg-zinc-900 rounded-xl p-4 mb-3 border border-zinc-800',
        isExpired ? 'opacity-80' : null
      )}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-zinc-800 rounded-lg items-center justify-center mr-3">
            <Text className="text-white text-lg">{getActionIcon()}</Text>
          </View>
          <View>
            <Text className="text-white font-semibold text-base">
              {approval.coin}
            </Text>
            <Text className={cn('text-sm', getActionColor())}>
              {approval.action.charAt(0).toUpperCase() + approval.action.slice(1)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-white font-bold text-lg">{approval.amount}</Text>
          {!isExpired ? (
            <Text className="text-zinc-500 text-xs">
              {minutesLeft}:{secondsLeft.toString().padStart(2, '0')} left
            </Text>
          ) : (
            <Text className="text-red-500 text-xs">Expired</Text>
          )}
        </View>
      </View>

      {isExpired && (
        <View className="mt-3 pt-3 border-t border-zinc-800">
          <Text className="text-red-500 text-sm">This action has expired</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}
