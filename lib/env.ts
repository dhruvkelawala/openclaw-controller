import Constants from 'expo-constants';

export const ENV = {
  BACKEND_URL:
    Constants.expoConfig?.extra?.backendUrl ??
    'https://openclaw-prod.tailbc93c6.ts.net',
  EAS_PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId ?? '',
} as const;

if (!ENV.EAS_PROJECT_ID && !__DEV__) {
  // eslint-disable-next-line no-console
  console.warn(
    'EAS_PROJECT_ID not configured - push notifications may not work'
  );
}
