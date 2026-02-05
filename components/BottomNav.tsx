import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '../lib/cn';

type Route = Parameters<typeof router.push>[0];

interface NavItem {
  path: Route;
  icon: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', icon: '📋', label: 'Pending' },
  { path: '/history', icon: '📜', label: 'History' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    scale.value = withSpring(0.92, { stiffness: 300, damping: 18 }, () => {
      scale.value = withSpring(1, { stiffness: 300, damping: 18 });
    });

    router.push(item.path);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className="items-center py-2 px-4"
    >
      <Text className={cn('text-2xl mb-1', isActive ? 'opacity-100' : 'opacity-50')}>
        {item.icon}
      </Text>
      <Text
        className={cn(
          'text-xs',
          isActive ? 'text-white font-medium' : 'text-zinc-500'
        )}
      >
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800/50">
      <View className="flex-row justify-around py-3 px-6 pb-6">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.path || (item.path === '/' && pathname === '/index');

          return (
            <NavButton key={item.label} item={item} isActive={isActive} />
          );
        })}
      </View>
    </View>
  );
}
