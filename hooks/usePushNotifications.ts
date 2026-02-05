import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { NotificationPayload, ApprovalAction } from '../types';
import { useApprovalsStore } from '../store/approvalsStore';
import { ENV } from '../lib/env';

// Type guard for notification payload
function isNotificationPayload(data: unknown): data is NotificationPayload {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.actionId === 'string' &&
    typeof obj.coin === 'string' &&
    typeof obj.action === 'string' &&
    typeof obj.amount === 'string' &&
    typeof obj.expiry === 'number' &&
    typeof obj.approveUrl === 'string' &&
    typeof obj.rejectUrl === 'string'
  );
}

// Validate and coerce action string to ApprovalAction['action']
const VALID_ACTIONS = ['swap', 'transfer', 'trade', 'stake', 'unstake', 'other'] as const;
function toApprovalAction(action: string): ApprovalAction['action'] {
  return VALID_ACTIONS.includes(action as ApprovalAction['action']) 
    ? (action as ApprovalAction['action']) 
    : 'other';
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  
  const addPendingApproval = useApprovalsStore((state) => state.addPendingApproval);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }
      
      setPermissionStatus(finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  // Get push token
  const getPushToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: ENV.EAS_PROJECT_ID,
        })
      ).data;
      
      console.log('Expo Push Token:', token);
      setExpoPushToken(token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }, []);

  // Handle notification data
  const handleNotificationData = useCallback((data: NotificationPayload) => {
    const approval: ApprovalAction = {
      id: data.actionId,
      coin: data.coin,
      action: toApprovalAction(data.action),
      amount: data.amount,
      expiry: data.expiry,
      approveUrl: data.approveUrl,
      rejectUrl: data.rejectUrl,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    addPendingApproval(approval);
  }, [addPendingApproval]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from OpenClaw Controller',
          data: {
            actionId: `test-${Date.now()}`,
            coin: 'ETH',
            action: 'swap',
            amount: '1.5',
            expiry: Date.now() + 300000,
            approveUrl: `${ENV.BACKEND_URL}/approve`,
            rejectUrl: `${ENV.BACKEND_URL}/reject`,
          },
        },
        trigger: null, // Immediate
      });
      console.log('Test notification scheduled');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    // Request permissions and get token
    requestPermissions().then((granted: boolean) => {
      if (granted) {
        getPushToken();
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        setNotification(notification);
        
        // Extract data and add to pending approvals
        const data = notification.request.content.data;
        if (isNotificationPayload(data)) {
          handleNotificationData(data);
        }
      }
    );

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        const data = response.notification.request.content.data;

        if (isNotificationPayload(data)) {
          handleNotificationData(data);
          // Navigate to approval detail
          router.push(`/approval/${data.actionId}`);
        }
      }
    );

    // Check for initial notification (app opened from notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (isNotificationPayload(data)) {
          handleNotificationData(data);
          router.push(`/approval/${data.actionId}`);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [requestPermissions, getPushToken, handleNotificationData]);

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermissions,
    sendTestNotification,
  };
}