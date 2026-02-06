/**
 * PUSH NOTIFICATIONS DISABLED
 * 
 * This file has been modified to disable push notifications for UX testing
 * without requiring an Apple Developer Program enrollment.
 * 
 * To re-enable push notifications:
 * 1. Uncomment the original code below
 * 2. Re-enable the expo-notifications plugin in app.json
 * 3. Configure your EAS project ID
 * 
 * Original functionality: Request permissions, get push tokens, listen for notifications
 */

import { useState, useCallback } from 'react';
// DISABLED: Push notification imports
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import { router } from 'expo-router';
import { ApprovalAction } from '../types';
import { useApprovalsStore } from '../store/approvalsStore';
// DISABLED: Not needed without notifications
// import { ENV } from '../lib/env';
// import { NotificationPayloadSchema, ActionTypeSchema } from '../lib/schemas';
import { logger } from '../lib/logger';

// DISABLED: Action type helper - not needed when notifications disabled
// function toActionType(value: string): ApprovalAction['action'] {
//   const parsed = ActionTypeSchema.safeParse(value);
//   return parsed.success ? parsed.data : 'other';
// }

// DISABLED: Notification handler configuration
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

export function usePushNotifications() {
  // Return stub values - notifications are disabled
  const [expoPushToken] = useState<string | null>(null);
  const [notification] = useState<null>(null);
  // Return 'granted' to allow the app to function normally in UI
  const [permissionStatus] = useState<'granted' | 'denied' | null>('granted');

  // DISABLED: Store access not needed when notifications disabled
  // const addPendingApproval = useApprovalsStore((state) => state.addPendingApproval);

  // Stub: Request permissions (no-op when disabled)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    logger.log('[DISABLED] Push notifications are disabled for UX testing');
    return true; // Return true to allow UI to proceed
  }, []);

  // DISABLED: Original requestPermissions implementation
  // const requestPermissions = useCallback(async (): Promise<boolean> => {
  //   try {
  //     const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;
  //
  //     if (existingStatus !== 'granted') {
  //       const { status } = await Notifications.requestPermissionsAsync({
  //         ios: {
  //           allowAlert: true,
  //           allowBadge: true,
  //           allowSound: true,
  //         },
  //       });
  //       finalStatus = status;
  //     }
  //
  //     setPermissionStatus(finalStatus);
  //     return finalStatus === 'granted';
  //   } catch (error) {
  //     logger.error('Error requesting notification permissions:', error);
  //     return false;
  //   }
  // }, []);

  // Stub: Get push token (no-op when disabled)
  const getPushToken = useCallback(async (): Promise<string | null> => {
    logger.log('[DISABLED] Push token retrieval is disabled for UX testing');
    return null;
  }, []);

  // DISABLED: Original getPushToken implementation
  // const getPushToken = useCallback(async (): Promise<string | null> => {
  //   try {
  //     if (!Device.isDevice) {
  //       logger.warn('Must use physical device for Push Notifications');
  //       return null;
  //     }
  //
  //     const token = (
  //       await Notifications.getExpoPushTokenAsync({
  //         projectId: ENV.EAS_PROJECT_ID,
  //       })
  //     ).data;
  //
  //     logger.log('Expo Push Token:', token);
  //     setExpoPushToken(token);
  //     return token;
  //   } catch (error) {
  //     logger.error('Error getting push token:', error);
  //     return null;
  //   }
  // }, []);

  // DISABLED: Handle notification data - not needed when notifications disabled
  // const handleNotificationData = useCallback(
  //   (rawData: unknown) => {
  //     const parsed = NotificationPayloadSchema.safeParse(rawData);
  //     if (!parsed.success) {
  //       logger.warn('Invalid notification payload:', parsed.error);
  //       return;
  //     }
  //
  //     const data = parsed.data;
  //     const approval: ApprovalAction = {
  //       id: data.actionId,
  //       coin: data.coin,
  //       action: toActionType(data.action),
  //       amount: data.amount,
  //       expiry: data.expiry,
  //       approveUrl: data.approveUrl,
  //       rejectUrl: data.rejectUrl,
  //       status: 'pending',
  //       timestamp: Date.now(),
  //     };
  //
  //     addPendingApproval(approval);
  //   },
  //   [addPendingApproval]
  // );

  // Stub: Send test notification (no-op when disabled)
  const sendTestNotification = useCallback(async () => {
    logger.log('[DISABLED] Test notifications are disabled for UX testing');
    // Could optionally show an alert here instead
  }, []);

  // DISABLED: Original sendTestNotification implementation
  // const sendTestNotification = useCallback(async () => {
  //   try {
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: 'Test Notification',
  //         body: 'This is a test notification from OpenClaw Controller',
  //         data: {
  //           actionId: `test-${Date.now()}`,
  //           coin: 'ETH',
  //           action: 'swap',
  //           amount: '1.5',
  //           expiry: Date.now() + 300000,
  //           approveUrl: `${ENV.BACKEND_URL}/approve`,
  //           rejectUrl: `${ENV.BACKEND_URL}/reject`,
  //         },
  //       },
  //       trigger: null, // Immediate
  //     });
  //     logger.log('Test notification scheduled');
  //   } catch (error) {
  //     logger.error('Error sending test notification:', error);
  //   }
  // }, []);

  // DISABLED: useEffect for notification listeners
  // useEffect(() => {
  //   // Request permissions and get token
  //   requestPermissions().then((granted: boolean) => {
  //     if (granted) {
  //       getPushToken();
  //     }
  //   });
  //
  //   // Listen for incoming notifications
  //   notificationListener.current = Notifications.addNotificationReceivedListener(
  //     (nextNotification) => {
  //       logger.log('Notification received:', nextNotification);
  //       setNotification(nextNotification);
  //
  //       handleNotificationData(nextNotification.request.content.data);
  //     }
  //   );
  //
  //   // Listen for notification responses (when user taps notification)
  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(
  //     (response) => {
  //       logger.log('Notification response:', response);
  //       const data = response.notification.request.content.data;
  //
  //       handleNotificationData(data);
  //
  //       const parsed = NotificationPayloadSchema.safeParse(data);
  //       if (parsed.success) {
  //         router.push(`/approval/${parsed.data.actionId}`);
  //       }
  //     }
  //   );
  //
  //   // Check for initial notification (app opened from notification)
  //   Notifications.getLastNotificationResponseAsync().then((response) => {
  //     if (!response) return;
  //
  //     const data = response.notification.request.content.data;
  //     handleNotificationData(data);
  //
  //     const parsed = NotificationPayloadSchema.safeParse(data);
  //     if (parsed.success) {
  //       router.push(`/approval/${parsed.data.actionId}`);
  //     }
  //   });
  //
  //   return () => {
  //     notificationListener.current?.remove();
  //     responseListener.current?.remove();
  //   };
  // }, [requestPermissions, getPushToken, handleNotificationData]);

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermissions,
    sendTestNotification,
  };
}
