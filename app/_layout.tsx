import '../lib/polyfills';
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#000000',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'OpenClaw',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="approval/[id]"
          options={{
            title: 'Approval',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'History',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}