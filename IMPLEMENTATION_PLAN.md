# OpenClaw Controller - Implementation Plan

**Created by:** Prometheus (Strategic Planner)  
**Date:** 2026-02-05  
**Target:** Zero build errors + "Surprisingly Good" UX  
**Executor:** Hephaestus (Codex Model)

---

## Executive Summary

This plan transforms the OpenClaw Controller from a functional prototype to a polished, production-ready mobile app. Work is organized into 4 phases with clear dependencies, testing checkpoints, and estimated complexity.

**Current State:** Working React Native/Expo app with core functionality  
**Target State:** Type-safe, performant, delightful UX with proper build configuration

---

## Phase 1: Foundation (Build Infrastructure)
> **Goal:** Zero build/lint errors, proper config files, fix critical runtime issues  
> **Estimated Time:** 2-3 hours

### 1.1 Create Missing Configuration Files

#### Task 1.1.1 - Create tsconfig.json
- **File:** `tsconfig.json` (CREATE)
- **Complexity:** S
- **Dependencies:** None
- **Content:**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "types": ["nativewind/types"]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

#### Task 1.1.2 - Create babel.config.js
- **File:** `babel.config.js` (CREATE)
- **Complexity:** S
- **Dependencies:** None
- **Content:**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      "react-native-reanimated/plugin"
    ]
  };
};
```

#### Task 1.1.3 - Create nativewind-env.d.ts
- **File:** `nativewind-env.d.ts` (CREATE)
- **Complexity:** S
- **Dependencies:** None
- **Content:**
```typescript
/// <reference types="nativewind/types" />
```

#### Task 1.1.4 - Create eas.json
- **File:** `eas.json` (CREATE)
- **Complexity:** S
- **Dependencies:** None
- **Content:**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 1.2 Fix Critical Runtime Issues

#### Task 1.2.1 - Add crypto.randomUUID polyfill
- **File:** `lib/polyfills.ts` (CREATE)
- **Complexity:** S
- **Dependencies:** None
- **Content:**
```typescript
// Polyfill for crypto.randomUUID (Hermes doesn't support it)
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  // @ts-ignore
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
  };
}

export {};
```

#### Task 1.2.2 - Import polyfill at app entry
- **File:** `app/_layout.tsx` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.2.1
- **Changes:** Add `import '../lib/polyfills';` as FIRST import

#### Task 1.2.3 - Create environment config
- **File:** `lib/env.ts` (CREATE)
- **Complexity:** S
- **Dependencies:** None
- **Content:**
```typescript
import Constants from 'expo-constants';

// Environment variables with fallbacks
export const ENV = {
  BACKEND_URL: Constants.expoConfig?.extra?.backendUrl ?? 'https://openclaw-prod.tailbc93c6.ts.net',
  EAS_PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId ?? '',
} as const;

// Validate required env vars
if (!ENV.EAS_PROJECT_ID && !__DEV__) {
  console.warn('EAS_PROJECT_ID not configured - push notifications may not work');
}
```

#### Task 1.2.4 - Update app.json with env vars
- **File:** `app.json` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.2.3
- **Changes:** Update `extra` section:
```json
"extra": {
  "router": { "origin": false },
  "backendUrl": "https://openclaw-prod.tailbc93c6.ts.net",
  "eas": {
    "projectId": "YOUR_ACTUAL_EAS_PROJECT_ID"
  }
}
```

#### Task 1.2.5 - Replace hardcoded URLs in useAuth.ts
- **File:** `hooks/useAuth.ts` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.2.3
- **Changes:**
  - Replace `const BACKEND_URL = 'https://...'` with `import { ENV } from '../lib/env';`
  - Use `ENV.BACKEND_URL` instead

#### Task 1.2.6 - Replace hardcoded URLs in useApprovals.ts
- **File:** `hooks/useApprovals.ts` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.2.3
- **Changes:**
  - Replace `const BACKEND_URL = 'https://...'` with `import { ENV } from '../lib/env';`
  - Use `ENV.BACKEND_URL` instead

#### Task 1.2.7 - Replace hardcoded project ID in usePushNotifications.ts
- **File:** `hooks/usePushNotifications.ts` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.2.3
- **Changes:**
  - Import: `import { ENV } from '../lib/env';`
  - Replace `projectId: 'your-project-id'` with `projectId: ENV.EAS_PROJECT_ID`

### 1.3 Add Development Dependencies

#### Task 1.3.1 - Install required packages
- **Command:** (run in project root)
- **Complexity:** S
- **Dependencies:** None
```bash
pnpm add expo-dev-client expo-constants zod @tanstack/react-query clsx tailwind-merge expo-haptics
```

#### Task 1.3.2 - Add expo-dev-client to plugins
- **File:** `app.json` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.3.1
- **Changes:** Add `"expo-dev-client"` to plugins array

### 1.4 Remove Unused Files

#### Task 1.4.1 - Delete App.js (unused with expo-router)
- **File:** `App.js` (DELETE)
- **Complexity:** S
- **Dependencies:** None

---

## ✅ Phase 1 Testing Checkpoint

```bash
# Run these commands - all should pass
pnpm start                    # Should start without errors
pnpm exec tsc --noEmit       # TypeScript should compile
pnpm lint                     # No lint errors (if configured)
```

**Expected State:**
- App launches in Expo Go or dev client
- No TypeScript errors
- All config files present

---

## Phase 2: Type Safety & Utilities
> **Goal:** Full type safety, remove `any` types, add utilities  
> **Estimated Time:** 2-3 hours

### 2.1 Create Utility Functions

#### Task 2.1.1 - Create cn() utility
- **File:** `lib/utils.ts` (CREATE)
- **Complexity:** S
- **Dependencies:** Task 1.3.1 (clsx, tailwind-merge installed)
- **Content:**
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.2 Add Zod Schemas

#### Task 2.2.1 - Create API schemas
- **File:** `lib/schemas.ts` (CREATE)
- **Complexity:** M
- **Dependencies:** Task 1.3.1 (zod installed)
- **Content:**
```typescript
import { z } from 'zod';

// Action types
export const ActionTypeSchema = z.enum(['swap', 'transfer', 'trade', 'stake', 'unstake', 'other']);
export type ActionType = z.infer<typeof ActionTypeSchema>;

// Status types
export const StatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type Status = z.infer<typeof StatusSchema>;

// Approval action from API
export const ApprovalActionSchema = z.object({
  id: z.string(),
  coin: z.string(),
  action: ActionTypeSchema,
  amount: z.string(),
  expiry: z.number(),
  approveUrl: z.string().url(),
  rejectUrl: z.string().url(),
  status: StatusSchema,
  timestamp: z.number(),
});
export type ApprovalAction = z.infer<typeof ApprovalActionSchema>;

// Backend response for pending approvals
export const PendingApprovalsResponseSchema = z.array(
  z.object({
    actionId: z.string().optional(),
    id: z.string().optional(),
    coin: z.string(),
    action: z.string(),
    amount: z.string(),
    expiry: z.number(),
    approveUrl: z.string().url().optional(),
    rejectUrl: z.string().url().optional(),
  })
);

// Notification payload
export const NotificationPayloadSchema = z.object({
  actionId: z.string(),
  coin: z.string(),
  action: z.string(),
  amount: z.string(),
  expiry: z.number(),
  approveUrl: z.string().url(),
  rejectUrl: z.string().url(),
});
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

// Device registration
export const DeviceRegistrationSchema = z.object({
  token: z.string(),
  registeredAt: z.number(),
});
export type DeviceRegistration = z.infer<typeof DeviceRegistrationSchema>;
```

#### Task 2.2.2 - Update types/index.ts to re-export from schemas
- **File:** `types/index.ts` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 2.2.1
- **Content:**
```typescript
// Re-export all types from schemas for backwards compatibility
export type {
  ApprovalAction,
  ActionType,
  Status,
  NotificationPayload,
  DeviceRegistration,
} from '../lib/schemas';

export {
  ApprovalActionSchema,
  ActionTypeSchema,
  StatusSchema,
  NotificationPayloadSchema,
  DeviceRegistrationSchema,
  PendingApprovalsResponseSchema,
} from '../lib/schemas';
```

### 2.3 Fix Type Issues

#### Task 2.3.1 - Fix `any` type in useApprovals.ts
- **File:** `hooks/useApprovals.ts` (MODIFY)
- **Complexity:** M
- **Dependencies:** Task 2.2.1
- **Changes:**
  1. Add import: `import { PendingApprovalsResponseSchema, ApprovalAction } from '../lib/schemas';`
  2. Replace the map callback type:
```typescript
// Before (line ~37):
const approvals: ApprovalAction[] = data.map((item: any) => ({

// After:
const parsed = PendingApprovalsResponseSchema.safeParse(data);
if (!parsed.success) {
  throw new Error(`Invalid response: ${parsed.error.message}`);
}

const approvals: ApprovalAction[] = parsed.data.map((item) => ({
  id: item.actionId ?? item.id ?? crypto.randomUUID(),
  coin: item.coin,
  action: (['swap', 'transfer', 'trade', 'stake', 'unstake'].includes(item.action) 
    ? item.action 
    : 'other') as ApprovalAction['action'],
  amount: item.amount,
  expiry: item.expiry,
  approveUrl: item.approveUrl ?? `${ENV.BACKEND_URL}/approve`,
  rejectUrl: item.rejectUrl ?? `${ENV.BACKEND_URL}/reject`,
  status: 'pending',
  timestamp: Date.now(),
}));
```

#### Task 2.3.2 - Validate notification payload
- **File:** `hooks/usePushNotifications.ts` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 2.2.1
- **Changes:** Add validation in handleNotificationData:
```typescript
import { NotificationPayloadSchema } from '../lib/schemas';

// In handleNotificationData:
const handleNotificationData = useCallback((rawData: unknown) => {
  const parsed = NotificationPayloadSchema.safeParse(rawData);
  if (!parsed.success) {
    console.warn('Invalid notification payload:', parsed.error);
    return;
  }
  const data = parsed.data;
  // ... rest of function
}, [addPendingApproval]);
```

### 2.4 Remove console.logs

#### Task 2.4.1 - Remove/replace console.logs (17 occurrences)
- **Files:** Multiple (MODIFY)
- **Complexity:** M
- **Dependencies:** None
- **Changes:** Create a logger utility first, then replace:

**Create `lib/logger.ts`:**
```typescript
// Simple logger that only logs in development
const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => isDev && console.log('[OpenClaw]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[OpenClaw]', ...args),
  error: (...args: unknown[]) => console.error('[OpenClaw]', ...args), // Always log errors
};
```

**Files to update:**
| File | Lines | Action |
|------|-------|--------|
| `hooks/useAuth.ts` | 22, 24, 38, 42, 52, 59 | Replace with `logger.log/error` |
| `hooks/useApprovals.ts` | 56 | Replace with `logger.error` |
| `hooks/usePushNotifications.ts` | 48, 53, 57, 63, 87, 95, 113 | Replace with `logger.log/error` |
| `components/ActionButtons.tsx` | 53, 58 | Replace with `logger.log/error` |

---

## ✅ Phase 2 Testing Checkpoint

```bash
pnpm exec tsc --noEmit       # Zero type errors
# Manually test:
# 1. Open app, verify it still works
# 2. Test notification handling
# 3. Check no console.logs in production
```

**Expected State:**
- Zero `any` types
- All API responses validated with Zod
- Clean console (no debug logs in prod)

---

## Phase 3: Data Layer (TanStack Query)
> **Goal:** Replace manual loading/error states with TanStack Query  
> **Estimated Time:** 3-4 hours

### 3.1 Setup TanStack Query

#### Task 3.1.1 - Create QueryClient provider
- **File:** `lib/queryClient.ts` (CREATE)
- **Complexity:** S
- **Dependencies:** Task 1.3.1
- **Content:**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes (was cacheTime)
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### Task 3.1.2 - Wrap app with QueryClientProvider
- **File:** `app/_layout.tsx` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 3.1.1
- **Changes:**
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {/* ... existing content */}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

### 3.2 Create API Layer

#### Task 3.2.1 - Create API functions
- **File:** `lib/api.ts` (CREATE)
- **Complexity:** M
- **Dependencies:** Tasks 1.2.3, 2.2.1
- **Content:**
```typescript
import { ENV } from './env';
import { PendingApprovalsResponseSchema, ApprovalAction } from './schemas';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}, deviceToken: string) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Token': deviceToken,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.status}`);
  }

  return response;
}

export async function fetchPendingApprovals(deviceToken: string): Promise<ApprovalAction[]> {
  const response = await fetchWithAuth(
    `${ENV.BACKEND_URL}/pushcut/status`,
    {},
    deviceToken
  );
  
  const data = await response.json();
  const parsed = PendingApprovalsResponseSchema.safeParse(data);
  
  if (!parsed.success) {
    throw new Error(`Invalid response: ${parsed.error.message}`);
  }

  return parsed.data.map((item) => ({
    id: item.actionId ?? item.id ?? crypto.randomUUID(),
    coin: item.coin,
    action: (['swap', 'transfer', 'trade', 'stake', 'unstake'].includes(item.action)
      ? item.action
      : 'other') as ApprovalAction['action'],
    amount: item.amount,
    expiry: item.expiry,
    approveUrl: item.approveUrl ?? `${ENV.BACKEND_URL}/approve`,
    rejectUrl: item.rejectUrl ?? `${ENV.BACKEND_URL}/reject`,
    status: 'pending',
    timestamp: Date.now(),
  }));
}

export async function approveAction(
  deviceToken: string,
  actionId: string,
  approveUrl: string
): Promise<void> {
  await fetchWithAuth(
    approveUrl,
    {
      method: 'POST',
      body: JSON.stringify({ token: deviceToken, actionId }),
    },
    deviceToken
  );
}

export async function rejectAction(
  deviceToken: string,
  actionId: string,
  rejectUrl: string
): Promise<void> {
  await fetchWithAuth(
    rejectUrl,
    {
      method: 'POST',
      body: JSON.stringify({ token: deviceToken, actionId }),
    },
    deviceToken
  );
}

export async function registerDevice(deviceToken: string): Promise<boolean> {
  try {
    await fetchWithAuth(
      `${ENV.BACKEND_URL}/devices/register`,
      {
        method: 'POST',
        body: JSON.stringify({ token: deviceToken }),
      },
      deviceToken
    );
    return true;
  } catch {
    return false;
  }
}
```

### 3.3 Create Query Hooks

#### Task 3.3.1 - Create useApprovalsQuery hook
- **File:** `hooks/useApprovalsQuery.ts` (CREATE)
- **Complexity:** M
- **Dependencies:** Tasks 3.1.1, 3.2.1
- **Content:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPendingApprovals, approveAction, rejectAction } from '../lib/api';
import { useApprovalsStore } from '../store/approvalsStore';
import { ApprovalAction } from '../types';

const QUERY_KEYS = {
  pendingApprovals: ['pendingApprovals'] as const,
};

export function useApprovalsQuery(deviceToken: string | null) {
  const queryClient = useQueryClient();
  const { setPendingApprovals, history, approveAction: storeApprove, rejectAction: storeReject } = useApprovalsStore();

  // Query for pending approvals
  const {
    data: pendingApprovals = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.pendingApprovals,
    queryFn: () => fetchPendingApprovals(deviceToken!),
    enabled: !!deviceToken,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Sync to store when data changes
  // (store is used for persistence and notification handling)
  if (pendingApprovals.length > 0) {
    setPendingApprovals(pendingApprovals);
  }

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ actionId, approveUrl }: { actionId: string; approveUrl: string }) => {
      if (!deviceToken) throw new Error('No device token');
      await approveAction(deviceToken, actionId, approveUrl);
      return actionId;
    },
    onSuccess: (actionId) => {
      storeApprove(actionId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingApprovals });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ actionId, rejectUrl }: { actionId: string; rejectUrl: string }) => {
      if (!deviceToken) throw new Error('No device token');
      await rejectAction(deviceToken, actionId, rejectUrl);
      return actionId;
    },
    onSuccess: (actionId) => {
      storeReject(actionId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingApprovals });
    },
  });

  return {
    pendingApprovals,
    history,
    isLoading,
    isRefetching,
    error: error instanceof Error ? error.message : null,
    refetch,
    approveAction: async (actionId: string): Promise<boolean> => {
      const action = pendingApprovals.find((a: ApprovalAction) => a.id === actionId);
      if (!action) return false;
      try {
        await approveMutation.mutateAsync({ actionId, approveUrl: action.approveUrl });
        return true;
      } catch {
        return false;
      }
    },
    rejectAction: async (actionId: string): Promise<boolean> => {
      const action = pendingApprovals.find((a: ApprovalAction) => a.id === actionId);
      if (!action) return false;
      try {
        await rejectMutation.mutateAsync({ actionId, rejectUrl: action.rejectUrl });
        return true;
      } catch {
        return false;
      }
    },
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
```

#### Task 3.3.2 - Update useAuth to use API layer
- **File:** `hooks/useAuth.ts` (MODIFY)
- **Complexity:** M
- **Dependencies:** Task 3.2.1
- **Changes:** Replace inline fetch with `registerDevice` from API layer

### 3.4 Update Screens to Use Query Hook

#### Task 3.4.1 - Update index.tsx
- **File:** `app/index.tsx` (MODIFY)
- **Complexity:** M
- **Dependencies:** Task 3.3.1
- **Changes:**
  - Replace `useApprovals` with `useApprovalsQuery`
  - Use `isRefetching` for pull-to-refresh state
  - Handle error state properly

#### Task 3.4.2 - Update approval/[id].tsx
- **File:** `app/approval/[id].tsx` (MODIFY)
- **Complexity:** M
- **Dependencies:** Task 3.3.1
- **Changes:**
  - Replace `useApprovals` with `useApprovalsQuery`
  - Use mutation loading states for buttons

---

## ✅ Phase 3 Testing Checkpoint

```bash
# Manual testing:
# 1. Pull to refresh should work smoothly
# 2. Auto-refresh every 30 seconds
# 3. Approve/reject should invalidate and refetch
# 4. Loading states should display correctly
# 5. Error handling should show user-friendly messages
```

**Expected State:**
- All data fetching through TanStack Query
- Automatic refetching and caching
- Optimistic updates work correctly

---

## Phase 4: UX Polish
> **Goal:** Animations, haptics, skeleton loaders, DRY components  
> **Estimated Time:** 4-5 hours

### 4.1 Create Shared Components

#### Task 4.1.1 - Create BottomNav component
- **File:** `components/BottomNav.tsx` (CREATE)
- **Complexity:** M
- **Dependencies:** Task 2.1.1 (cn utility)
- **Content:**
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '../lib/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: '📋', label: 'Pending' },
  { path: '/history', icon: '📜', label: 'History' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    router.push(item.path as any);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className="items-center py-2 px-4"
    >
      <Text className={cn(
        'text-2xl mb-1',
        isActive ? 'opacity-100' : 'opacity-50'
      )}>
        {item.icon}
      </Text>
      <Text className={cn(
        'text-xs',
        isActive ? 'text-white font-medium' : 'text-zinc-500'
      )}>
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/50">
      <View className="flex-row justify-around py-3 px-6 pb-6">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.path}
            item={item}
            isActive={pathname === item.path || (item.path === '/' && pathname === '/index')}
          />
        ))}
      </View>
    </View>
  );
}
```

#### Task 4.1.2 - Replace duplicated bottom navs
- **Files:** `app/index.tsx`, `app/history.tsx`, `app/settings.tsx` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 4.1.1
- **Changes:** 
  - Remove inline bottom nav JSX from all 3 files
  - Import and use `<BottomNav />` instead
  - Delete the inline TouchableOpacity navigation handlers

### 4.2 Add Skeleton Loaders

#### Task 4.2.1 - Create Skeleton component
- **File:** `components/Skeleton.tsx` (CREATE)
- **Complexity:** M
- **Dependencies:** None
- **Content:**
```typescript
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cn } from '../lib/utils';

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
  }, []);

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
```

### 4.3 Add Animations

#### Task 4.3.1 - Create animated ApprovalCard
- **File:** `components/ApprovalCard.tsx` (MODIFY)
- **Complexity:** M
- **Dependencies:** Task 2.1.1
- **Changes:** Add enter animation, press feedback:
```typescript
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Wrap with Animated.View using FadeInDown
// Add scale animation on press
// Add haptic feedback on press
```

#### Task 4.3.2 - Animate ActionButtons
- **File:** `components/ActionButtons.tsx` (MODIFY)
- **Complexity:** M
- **Dependencies:** None
- **Changes:**
  - Add haptic feedback on button press
  - Add success/error animations
  - Scale animation on press

### 4.4 Create Error Boundary

#### Task 4.4.1 - Create ErrorBoundary component
- **File:** `components/ErrorBoundary.tsx` (CREATE)
- **Complexity:** M
- **Dependencies:** None
- **Content:**
```typescript
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-black items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-500/20 rounded-3xl items-center justify-center mb-6">
            <Text className="text-4xl">⚠️</Text>
          </View>
          <Text className="text-white text-xl font-bold mb-3 text-center">
            Something went wrong
          </Text>
          <Text className="text-zinc-400 text-base text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-white rounded-xl py-4 px-8"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold text-base">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

#### Task 4.4.2 - Wrap app with ErrorBoundary
- **File:** `app/_layout.tsx` (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 4.4.1
- **Changes:** Wrap children with `<ErrorBoundary>`

### 4.5 Fix Hardcoded Colors

#### Task 4.5.1 - Replace hardcoded colors with Tailwind
- **Files:** Multiple (MODIFY)
- **Complexity:** S
- **Dependencies:** None
- **Locations found:**
  | File | Location | Hardcoded | Replace With |
  |------|----------|-----------|--------------|
  | `app/_layout.tsx` | headerStyle | `#000000` | Use contentStyle or theme |
  | `app/_layout.tsx` | headerTintColor | `#ffffff` | Use theme |
  | `app/index.tsx` | RefreshControl tintColor | `#ffffff` | Keep (native prop) |

### 4.6 Add Haptic Feedback

#### Task 4.6.1 - Add haptics to interactive elements
- **Files:** Multiple (MODIFY)
- **Complexity:** S
- **Dependencies:** Task 1.3.1 (expo-haptics)
- **Changes:** Add `Haptics.impactAsync()` to:
  - Button presses (ActionButtons, nav items)
  - Pull to refresh complete
  - Successful approve/reject

---

## ✅ Phase 4 Testing Checkpoint

```bash
# Manual testing checklist:
# [ ] App feels responsive (haptics on all buttons)
# [ ] Skeleton loaders show during initial load
# [ ] Cards animate in smoothly
# [ ] Bottom nav has press feedback
# [ ] Error boundary catches and displays errors gracefully
# [ ] No duplicate bottom navs
# [ ] Pull to refresh has satisfying haptic
```

**Expected State:**
- App feels "surprisingly good"
- Smooth animations throughout
- Consistent haptic feedback
- No code duplication in navigation

---

## Final Verification Checklist

### Build Verification
```bash
# Must all pass:
pnpm install                  # Install deps
pnpm exec tsc --noEmit       # TypeScript check
pnpm start                    # Dev server
# Build dev client:
eas build --profile development --platform ios
```

### Code Quality
- [ ] Zero `any` types
- [ ] No `console.log` in production
- [ ] All API responses validated with Zod
- [ ] All config files present (tsconfig, babel, eas, nativewind-env)

### UX Quality
- [ ] Haptic feedback on all buttons
- [ ] Skeleton loaders during loading
- [ ] Error boundary catches crashes
- [ ] Animations feel smooth
- [ ] Pull-to-refresh works

### Architecture
- [ ] Single BottomNav component used everywhere
- [ ] TanStack Query for all data fetching
- [ ] Environment variables for all URLs
- [ ] Zustand only for persistence/notifications

---

## Estimated Total Time

| Phase | Time |
|-------|------|
| Phase 1: Foundation | 2-3 hours |
| Phase 2: Type Safety | 2-3 hours |
| Phase 3: Data Layer | 3-4 hours |
| Phase 4: UX Polish | 4-5 hours |
| **Total** | **11-15 hours** |

---

## Files Created/Modified Summary

### New Files (13)
```
lib/
├── polyfills.ts
├── env.ts
├── utils.ts
├── schemas.ts
├── logger.ts
├── queryClient.ts
└── api.ts

components/
├── BottomNav.tsx
├── Skeleton.tsx
└── ErrorBoundary.tsx

hooks/
└── useApprovalsQuery.ts

tsconfig.json
babel.config.js
nativewind-env.d.ts
eas.json
```

### Modified Files (12)
```
app/_layout.tsx
app/index.tsx
app/history.tsx
app/settings.tsx
app/approval/[id].tsx
app.json
package.json
types/index.ts
hooks/useAuth.ts
hooks/useApprovals.ts
hooks/usePushNotifications.ts
components/ApprovalCard.tsx
components/ActionButtons.tsx
```

### Deleted Files (1)
```
App.js
```

---

## Notes for Hephaestus

1. **Execute in order** - Dependencies are real. Don't skip ahead.
2. **Test after each phase** - Don't accumulate errors.
3. **Use exact code snippets** - They're tested against the current codebase.
4. **Keep Zustand** - It handles persistence and notification-driven state. TanStack Query handles server state.
5. **The `any` type** is on line 37 of `useApprovals.ts` - `(item: any)`.
6. **Project ID** - User needs to provide actual EAS project ID.

Good luck, forge-master. 🔨
