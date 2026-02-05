import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useApprovalsStore } from "../store/approvalsStore";
import {
  ApprovalAction,
  ApprovalActionSchema,
  BackendApprovalItemSchema,
  DeviceRegistrationResponseSchema,
  ActionResponseSchema,
  ApproveActionPayloadSchema,
  RejectActionPayloadSchema,
  DeviceRegistrationPayloadSchema,
  NotificationPayloadSchema,
} from "../schemas";
import { BACKEND_URL } from "../lib/constants";

// Query keys for caching
export const queryKeys = {
  approvals: {
    all: ["approvals"] as const,
    pending: () => [...queryKeys.approvals.all, "pending"] as const,
    history: () => [...queryKeys.approvals.all, "history"] as const,
    detail: (id: string) => [...queryKeys.approvals.all, "detail", id] as const,
  },
  device: {
    all: ["device"] as const,
    registration: (token: string) => [...queryKeys.device.all, "registration", token] as const,
  },
};

// API Error class for typed error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Hook to fetch pending approvals with React Query
 */
export function usePendingApprovals(
  deviceToken: string | null,
  options?: Omit<UseQueryOptions<ApprovalAction[], ApiError>, "queryKey" | "queryFn">
) {
  const setPendingApprovals = useApprovalsStore((state) => state.setPendingApprovals);

  return useQuery<ApprovalAction[], ApiError>({
    queryKey: queryKeys.approvals.pending(),
    queryFn: async () => {
      if (!deviceToken) {
        throw new ApiError("Device token is required");
      }

      const response = await fetch(`${BACKEND_URL}/pushcut/status`, {
        headers: {
          "X-Device-Token": deviceToken,
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `Failed to fetch pending approvals: ${response.statusText}`,
          response.status
        );
      }

      const rawData = await response.json();

      // Validate response is an array
      if (!Array.isArray(rawData)) {
        throw new ApiError("Invalid response format: expected array");
      }

      // Transform and validate each approval item
      const approvals: ApprovalAction[] = rawData.map((item: unknown, index: number) => {
        // First validate the backend item structure
        const backendResult = BackendApprovalItemSchema.safeParse(item);
        if (!backendResult.success) {
          console.error(`Invalid approval item at index ${index}:`, backendResult.error);
          throw new ApiError(
            `Invalid approval item at index ${index}: ${backendResult.error.message}`
          );
        }

        const backendItem = backendResult.data;

        // Transform to ApprovalAction format
        const approvalAction = {
          id: backendItem.actionId || backendItem.id || `unknown-${index}`,
          coin: backendItem.coin,
          action: backendItem.action,
          amount: backendItem.amount,
          expiry: backendItem.expiry,
          approveUrl: backendItem.approveUrl || `${BACKEND_URL}/approve`,
          rejectUrl: backendItem.rejectUrl || `${BACKEND_URL}/reject`,
          status: "pending" as const,
          timestamp: Date.now(),
        };

        // Validate the final ApprovalAction
        const result = ApprovalActionSchema.safeParse(approvalAction);
        if (!result.success) {
          console.error(`Transformed approval validation failed at index ${index}:`, result.error);
          throw new ApiError(
            `Approval validation failed at index ${index}: ${result.error.message}`
          );
        }

        return result.data;
      });

      // Sync with Zustand store
      setPendingApprovals(approvals);

      return approvals;
    },
    enabled: !!deviceToken,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
    refetchIntervalInBackground: true,
    ...options,
  });
}

/**
 * Hook for approving an action with optimistic updates
 */
export function useApproveAction(deviceToken: string | null) {
  const queryClient = useQueryClient();
  const storeApproveAction = useApprovalsStore((state) => state.approveAction);
  const moveToHistory = useApprovalsStore((state) => state.moveToHistory);

  return useMutation<boolean, ApiError, { actionId: string }>({
    mutationFn: async ({ actionId }) => {
      if (!deviceToken) {
        throw new ApiError("Device token is required");
      }

      // Validate payload before sending
      const payload = { token: deviceToken, actionId };
      const payloadResult = ApproveActionPayloadSchema.safeParse(payload);
      if (!payloadResult.success) {
        throw new ApiError(`Invalid payload: ${payloadResult.error.message}`);
      }

      // Get current approvals to find the action
      const currentApprovals = queryClient.getQueryData<ApprovalAction[]>(
        queryKeys.approvals.pending()
      );
      const action = currentApprovals?.find((a) => a.id === actionId);

      if (!action) {
        throw new ApiError("Action not found");
      }

      const response = await fetch(action.approveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Token": deviceToken,
        },
        body: JSON.stringify(payloadResult.data),
      });

      if (!response.ok) {
        throw new ApiError(`Approval failed: ${response.statusText}`, response.status);
      }

      const rawData = await response.json();

      // Validate response
      const result = ActionResponseSchema.safeParse(rawData);
      if (!result.success) {
        console.warn("Non-standard API response:", rawData);
        // Still consider it a success if status is OK
      }

      return true;
    },
    onMutate: async ({ actionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.approvals.pending() });

      // Snapshot the previous value
      const previousApprovals = queryClient.getQueryData<ApprovalAction[]>(
        queryKeys.approvals.pending()
      );

      // Optimistically update the cache
      queryClient.setQueryData<ApprovalAction[]>(
        queryKeys.approvals.pending(),
        (old) => old?.filter((a) => a.id !== actionId) ?? []
      );

      // Also update Zustand store optimistically
      storeApproveAction(actionId);
      moveToHistory(actionId, "approved");

      return { previousApprovals };
    },
    onError: (_err, { actionId }, context) => {
      // Rollback on error
      if (context?.previousApprovals) {
        queryClient.setQueryData(queryKeys.approvals.pending(), context.previousApprovals);
      }
      console.error(`Failed to approve action ${actionId}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pending() });
    },
  });
}

/**
 * Hook for rejecting an action with optimistic updates
 */
export function useRejectAction(deviceToken: string | null) {
  const queryClient = useQueryClient();
  const storeRejectAction = useApprovalsStore((state) => state.rejectAction);
  const moveToHistory = useApprovalsStore((state) => state.moveToHistory);

  return useMutation<boolean, ApiError, { actionId: string }>({
    mutationFn: async ({ actionId }) => {
      if (!deviceToken) {
        throw new ApiError("Device token is required");
      }

      // Validate payload before sending
      const payload = { token: deviceToken, actionId };
      const payloadResult = RejectActionPayloadSchema.safeParse(payload);
      if (!payloadResult.success) {
        throw new ApiError(`Invalid payload: ${payloadResult.error.message}`);
      }

      // Get current approvals to find the action
      const currentApprovals = queryClient.getQueryData<ApprovalAction[]>(
        queryKeys.approvals.pending()
      );
      const action = currentApprovals?.find((a) => a.id === actionId);

      if (!action) {
        throw new ApiError("Action not found");
      }

      const response = await fetch(action.rejectUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Token": deviceToken,
        },
        body: JSON.stringify(payloadResult.data),
      });

      if (!response.ok) {
        throw new ApiError(`Rejection failed: ${response.statusText}`, response.status);
      }

      const rawData = await response.json();

      // Validate response
      const result = ActionResponseSchema.safeParse(rawData);
      if (!result.success) {
        console.warn("Non-standard API response:", rawData);
        // Still consider it a success if status is OK
      }

      return true;
    },
    onMutate: async ({ actionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.approvals.pending() });

      // Snapshot the previous value
      const previousApprovals = queryClient.getQueryData<ApprovalAction[]>(
        queryKeys.approvals.pending()
      );

      // Optimistically update the cache
      queryClient.setQueryData<ApprovalAction[]>(
        queryKeys.approvals.pending(),
        (old) => old?.filter((a) => a.id !== actionId) ?? []
      );

      // Also update Zustand store optimistically
      storeRejectAction(actionId);
      moveToHistory(actionId, "rejected");

      return { previousApprovals };
    },
    onError: (_err, { actionId }, context) => {
      // Rollback on error
      if (context?.previousApprovals) {
        queryClient.setQueryData(queryKeys.approvals.pending(), context.previousApprovals);
      }
      console.error(`Failed to reject action ${actionId}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pending() });
    },
  });
}

/**
 * Hook for registering a device with the backend
 */
export function useRegisterDevice(deviceToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<boolean, ApiError, { pushToken?: string }>({
    mutationFn: async ({ pushToken }) => {
      if (!deviceToken) {
        throw new ApiError("Device token is required");
      }

      // Validate payload
      const payload = { token: deviceToken, pushToken };
      const payloadResult = DeviceRegistrationPayloadSchema.safeParse(payload);
      if (!payloadResult.success) {
        throw new ApiError(`Invalid payload: ${payloadResult.error.message}`);
      }

      const response = await fetch(`${BACKEND_URL}/devices/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Token": deviceToken,
        },
        body: JSON.stringify(payloadResult.data),
      });

      if (!response.ok) {
        throw new ApiError(`Device registration failed: ${response.statusText}`, response.status);
      }

      const rawData = await response.json();

      // Validate response
      const result = DeviceRegistrationResponseSchema.safeParse(rawData);
      if (!result.success) {
        console.warn("Non-standard registration response:", rawData);
        // Consider it success if status is OK
        return true;
      }

      return result.data.success;
    },
    onSuccess: () => {
      // Invalidate device registration query
      if (deviceToken) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.device.registration(deviceToken),
        });
      }
    },
  });
}

/**
 * Helper function to validate notification payload from push notifications
 */
export function validateNotificationPayload(data: unknown): {
  valid: boolean;
  data?: NotificationPayload;
  error?: string;
} {
  const result = NotificationPayloadSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  } else {
    return { valid: false, error: result.error.message };
  }
}
