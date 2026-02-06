import { useState, useEffect, useRef, useCallback } from 'react';
// Push notifications disabled for local testing without Apple Developer Program
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { router } from 'expo-router';
// import { ApprovalAction } from '../types';
// import { useApprovalsStore } from '../store/approvalsStore';
// import { ENV } from '../lib/env';
// import { NotificationPayloadSchema, ActionTypeSchema } from '../lib/schemas';
import { logger } from '../lib/logger';

// function toActionType(value: string): ApprovalAction['action'] {
//   const parsed = ActionTypeSchema.safeParse(value);
//   return parsed.success ? parsed.data : 'other';
// }

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
  // Disabled - returns mock values for local testing without Apple Developer Program
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('denied');
  // const notificationListener = useRef<Notifications.Subscription | null>(null);
  // const responseListener = useRef<Notifications.Subscription | null>(null);

  // const addPendingApproval = useApprovalsStore((state) => state.addPendingApproval);

  // Request permissions - disabled
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    logger.warn('Push notifications disabled for local testing');
    return false;
  }, []);

  // Get push token - disabled
  const getPushToken = useCallback(async (): Promise<string | null> => {
    logger.warn('Push token disabled for local testing');
    return null;
  }, []);

  // Handle notification data - disabled
  // const handleNotificationData = useCallback(
  //   (rawData: unknown) => {
  //     const parsed = NotificationPayloadSchema.safeParse(rawData);
  //     if (!parsed.success) {
  //       logger.warn('Invalid notification payload:', parsed.error);
  //       return;
  //     }

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

  //     addPendingApproval(approval);
  //   },
  //   [addPendingApproval]
  // );

  // Send test notification - disabled
  const sendTestNotification = useCallback(async () => {
    logger.warn('Test notifications disabled for local testing');
  }, []);

  // Initialize - disabled
  useEffect(() => {
    logger.info('Push notifications disabled - using manual refresh only');
    
    // No notification listeners set up for local testing

    return () => {
      // Cleanup - nothing to do
    };
  }, []);

  return {
    expoPushToken: null,
    notification: null,
    permissionStatus: 'denied' as const,
    requestPermissions,
    sendTestNotification,
  };
}
