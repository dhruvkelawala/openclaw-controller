import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cn } from '../lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn('bg-zinc-800 rounded-lg', className)}
    />
  );
}

export function ApprovalCardSkeleton() {
  return (
    <View className="bg-zinc-900 rounded-xl p-4 mb-3 border border-zinc-800">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <Skeleton className="w-10 h-10 rounded-lg mr-3" />
          <View>
            <Skeleton className="w-16 h-5 mb-2" />
            <Skeleton className="w-12 h-4" />
          </View>
        </View>
        <View className="items-end">
          <Skeleton className="w-14 h-6 mb-2" />
          <Skeleton className="w-16 h-3" />
        </View>
      </View>
    </View>
  );
}

export function ApprovalListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="px-4 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <ApprovalCardSkeleton key={i} />
      ))}
    </View>
  );
}
