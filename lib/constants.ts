/**
 * Backend URL for OpenClaw API
 */
export const BACKEND_URL = "https://openclaw-prod.tailbc93c6.ts.net";

/**
 * Secure storage keys
 */
export const STORAGE_KEYS = {
  DEVICE_TOKEN: "openclaw_device_token",
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  DEVICES_REGISTER: "/devices/register",
  PENDING_APPROVALS: "/pushcut/status",
  APPROVE: "/approve",
  REJECT: "/reject",
} as const;
