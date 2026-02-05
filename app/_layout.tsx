import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout() {
  // Create a client that persists for the lifetime of the app
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global defaults for all queries
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Global defaults for all mutations
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#000000",
            },
            headerTintColor: "#ffffff",
            headerTitleStyle: {
              fontWeight: "600",
            },
            contentStyle: {
              backgroundColor: "#000000",
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "OpenClaw",
              headerLargeTitle: true,
            }}
          />
          <Stack.Screen
            name="approval/[id]"
            options={{
              title: "Approval",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              title: "History",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
