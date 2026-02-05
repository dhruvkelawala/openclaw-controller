import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS, BACKEND_URL } from "../lib/constants";
import { DeviceRegistrationPayloadSchema, DeviceRegistrationResponseSchema } from "../schemas";

export function useAuth() {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  // Generate or retrieve device token
  const getOrCreateDeviceToken = useCallback(async (): Promise<string> => {
    try {
      let token = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_TOKEN);

      if (!token) {
        // Generate new UUID
        token = crypto.randomUUID();
        await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_TOKEN, token);
        console.log("Generated new device token:", token);
      } else {
        console.log("Retrieved existing device token:", token);
      }

      return token;
    } catch (error) {
      console.error("Error managing device token:", error);
      throw error;
    }
  }, []);

  // Register device with backend
  const registerDevice = useCallback(async (token: string): Promise<boolean> => {
    try {
      // Validate payload before sending
      const payload = { token };
      const payloadResult = DeviceRegistrationPayloadSchema.safeParse(payload);
      if (!payloadResult.success) {
        console.error("Invalid registration payload:", payloadResult.error);
        return false;
      }

      const response = await fetch(`${BACKEND_URL}/devices/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Token": token,
        },
        body: JSON.stringify(payloadResult.data),
      });

      if (response.ok) {
        // Validate response if there's body data
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const rawData = await response.json();
          const result = DeviceRegistrationResponseSchema.safeParse(rawData);
          if (!result.success) {
            console.warn("Non-standard registration response:", rawData);
          }
        }
        console.log("Device registered successfully");
        return true;
      } else {
        console.error("Device registration failed:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error registering device:", error);
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
        console.error("Auth initialization error:", error);
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
