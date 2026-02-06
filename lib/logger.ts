const isDev = __DEV__;

export const logger = {
  log: (...args: readonly unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[OpenClaw]', ...args);
    }
  },
  warn: (...args: readonly unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('[OpenClaw]', ...args);
    }
  },
  error: (...args: readonly unknown[]): void => {
    // Always log errors
    // eslint-disable-next-line no-console
    console.error('[OpenClaw]', ...args);
  },
};
