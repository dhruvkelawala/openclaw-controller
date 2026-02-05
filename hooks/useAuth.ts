import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../lib/env';
import { logger } from '../lib/logger';

const DEVICE_TOKEN_KEY = 'openclaw_device_token';

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
        logger.log('Generated new device token:', token);
      } else {
        logger.log('Retrieved existing device token:', token);
      }
      
      return token;
    } catch (error) {
      logger.error('Error managing device token:', error);
      throw error;
    }
  }, []);

  // Register device with backend
  const registerDevice = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${ENV.BACKEND_URL}/devices/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Token': token,
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        logger.log('Device registered successfully');
        return true;
      }

      logger.error('Device registration failed:', response.status);
      return false;
    } catch (error) {
      logger.error('Error registering device:', error);
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
        logger.error('Auth initialization error:', error);
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