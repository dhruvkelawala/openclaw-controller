import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

interface ActionButtonsProps {
  onApprove: () => Promise<boolean>;
  onReject: () => Promise<boolean>;
  disabled?: boolean;
}

export function ActionButtons({ onApprove, onReject, disabled = false }: ActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateAndExecute = async (action: () => Promise<boolean>, actionName: string) => {
    setIsAuthenticating(true);
    
    try {
      // Check if device supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        // Fall back to simple confirmation if biometrics not available
        Alert.alert(
          'Confirm Action',
          `Are you sure you want to ${actionName.toLowerCase()} this action?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: actionName, 
              onPress: async () => {
                setIsLoading(true);
                await action();
                setIsLoading(false);
              }
            },
          ]
        );
        return;
      }

      // Attempt biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate to ${actionName}`,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticating(false);
        setIsLoading(true);
        const success = await action();
        if (!success) {
          Alert.alert('Error', `Failed to ${actionName.toLowerCase()} the action. Please try again.`);
        }
        setIsLoading(false);
      } else {
        // Authentication cancelled or failed
        console.log('Authentication cancelled or failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading || isAuthenticating) {
    return (
      <View className="flex-row gap-3">
        <View className="flex-1 bg-zinc-800 rounded-xl py-4 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
          <Text className="text-zinc-400 text-sm mt-2">
            {isAuthenticating ? 'Authenticating...' : 'Processing...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={() => authenticateAndExecute(onReject, 'Reject')}
        disabled={disabled}
        className={`flex-1 bg-red-500/20 rounded-xl py-4 items-center border border-red-500/30 ${disabled ? 'opacity-50' : ''}`}
        activeOpacity={0.7}
      >
        <Text className="text-red-500 font-semibold text-base">Reject</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => authenticateAndExecute(onApprove, 'Approve')}
        disabled={disabled}
        className={`flex-1 bg-green-500/20 rounded-xl py-4 items-center border border-green-500/30 ${disabled ? 'opacity-50' : ''}`}
        activeOpacity={0.7}
      >
        <Text className="text-green-500 font-semibold text-base">Approve</Text>
      </TouchableOpacity>
    </View>
  );
}