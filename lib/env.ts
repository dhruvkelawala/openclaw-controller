import Constants from 'expo-constants';
import { logger } from './logger';

export const ENV = {
  BACKEND_URL:
    Constants.expoConfig?.extra?.backendUrl ??
    'https://openclaw-prod.tailbc93c6.ts.net',
  EAS_PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId ?? '',
  // Flag to check if push notifications are disabled
  PUSH_NOTIFICATIONS_DISABLED: Constants.expoConfig?.extra?._pushNotificationsDisabled ?? false,
} as const;

// DISABLED: Push notification warning - not needed for UX testing
// if (!ENV.EAS_PROJECT_ID && !__DEV__) {
//   logger.warn('EAS_PROJECT_ID not configured - push notifications may not work');
// }

if (ENV.PUSH_NOTIFICATIONS_DISABLED) {
  logger.log('Push notifications are disabled for UX testing');
}
