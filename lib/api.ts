import { ENV } from './env';
import {
  PendingApprovalsResponseSchema,
  ActionTypeSchema,
  type ApprovalAction,
} from './schemas';

class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(
  url: string,
  options: RequestInit,
  deviceToken: string
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Token': deviceToken,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.status}`);
  }

  return response;
}

function toActionType(value: string): ApprovalAction['action'] {
  const parsed = ActionTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : 'other';
}

export async function fetchPendingApprovals(
  deviceToken: string
): Promise<ApprovalAction[]> {
  const response = await fetchWithAuth(
    `${ENV.BACKEND_URL}/pushcut/status`,
    { method: 'GET' },
    deviceToken
  );

  const rawData: unknown = await response.json();
  const parsed = PendingApprovalsResponseSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error(`Invalid response: ${parsed.error.message}`);
  }

  return parsed.data.map((item) => ({
    id: item.actionId ?? item.id ?? crypto.randomUUID(),
    coin: item.coin,
    action: toActionType(item.action),
    amount: item.amount,
    expiry: item.expiry,
    approveUrl: item.approveUrl ?? `${ENV.BACKEND_URL}/approve`,
    rejectUrl: item.rejectUrl ?? `${ENV.BACKEND_URL}/reject`,
    status: 'pending',
    timestamp: Date.now(),
  }));
}

export async function approveAction(params: {
  deviceToken: string;
  actionId: string;
  approveUrl: string;
}): Promise<void> {
  const { deviceToken, actionId, approveUrl } = params;
  await fetchWithAuth(
    approveUrl,
    {
      method: 'POST',
      body: JSON.stringify({ token: deviceToken, actionId }),
    },
    deviceToken
  );
}

export async function rejectAction(params: {
  deviceToken: string;
  actionId: string;
  rejectUrl: string;
}): Promise<void> {
  const { deviceToken, actionId, rejectUrl } = params;
  await fetchWithAuth(
    rejectUrl,
    {
      method: 'POST',
      body: JSON.stringify({ token: deviceToken, actionId }),
    },
    deviceToken
  );
}

export async function registerDevice(deviceToken: string): Promise<boolean> {
  try {
    await fetchWithAuth(
      `${ENV.BACKEND_URL}/devices/register`,
      {
        method: 'POST',
        body: JSON.stringify({ token: deviceToken }),
      },
      deviceToken
    );
    return true;
  } catch {
    return false;
  }
}
