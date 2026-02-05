import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
// Types available if needed for future auth enhancements

const DEVICE_TOKEN_KEY = 'openclaw_device_token';
const BACKEND_URL = 'https://openclaw-prod.tailbc93c6.ts.net';

export function useAuth() {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  // Generate or retrieve device token
  const getOrCreateDeviceToken = useCallback(async (): Promise<string> => {
    try {
      let token = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
      
      if (!token) {
        // Generate new UUID
        token = crypto.randomUUID();
        await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
        console.log('Generated new device token:', token);
      } else {
        console.log('Retrieved existing device token:', token);
      }
      
      return token;
    } catch (error) {
      console.error('Error managing device token:', error);
      throw error;
    }
  }, []);

  // Register device with backend
  const registerDevice = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/devices/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Token': token,
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        console.log('Device registered successfully');
        return true;
      } else {
        console.error('Device registration failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }, []);

  // Initialize auth on app launch
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = await getOrCreateDeviceToken();
        setDeviceToken(token);
        
        const registered = await registerDevice(token);
        setIsRegistered(registered);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [getOrCreateDeviceToken, registerDevice]);

  // Re-register device (useful for recovery)
  const reRegister = useCallback(async () => {
    if (!deviceToken) return false;
    const registered = await registerDevice(deviceToken);
    setIsRegistered(registered);
    return registered;
  }, [deviceToken, registerDevice]);

  return {
    deviceToken,
    isLoading,
    isRegistered,
    reRegister,
  };
}