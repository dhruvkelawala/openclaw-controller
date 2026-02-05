/**
 * @deprecated Use `usePendingApprovals`, `useApproveAction`, and `useRejectAction` from `useApprovalsQuery.ts` instead.
 * This file is kept for backward compatibility but will be removed in a future version.
 */

import { useState, useCallback, useEffect } from "react";
import { useApprovalsStore } from "../store/approvalsStore";
import { ApprovalAction } from "../schemas";
import { BACKEND_URL } from "../lib/constants";

interface UseApprovalsOptions {
  deviceToken: string | null;
}

/**
 * @deprecated Use `usePendingApprovals` from `useApprovalsQuery.ts` instead.
 */
export function useApprovals({ deviceToken }: UseApprovalsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    pendingApprovals,
    history,
    setPendingApprovals,
    approveAction: storeApproveAction,
    rejectAction: storeRejectAction,
  } = useApprovalsStore();

  // Fetch pending approvals from backend
  const fetchPendingApprovals = useCallback(async () => {
    if (!deviceToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/pushcut/status`, {
        headers: {
          "X-Device-Token": deviceToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();

      // Transform backend response to ApprovalAction format
      const approvals: ApprovalAction[] = data.map((item: Record<string, unknown>) => ({
        id: (item.actionId as string) || (item.id as string),
        coin: item.coin as string,
        action: item.action as ApprovalAction["action"],
        amount: item.amount as string,
        expiry: item.expiry as number,
        approveUrl: (item.approveUrl as string) || `${BACKEND_URL}/approve`,
        rejectUrl: (item.rejectUrl as string) || `${BACKEND_URL}/reject`,
        status: "pending" as const,
        timestamp: Date.now(),
      }));

      setPendingApprovals(approvals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching pending approvals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceToken, setPendingApprovals]);

  // Approve an action
  const approveAction = useCallback(
    async (actionId: string): Promise<boolean> => {
      if (!deviceToken) return false;

      setIsLoading(true);
      setError(null);

      try {
        const action = pendingApprovals.find((a) => a.id === actionId);
        if (!action) {
          throw new Error("Action not found");
        }

        const response = await fetch(action.approveUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Device-Token": deviceToken,
          },
          body: JSON.stringify({ token: deviceToken, actionId }),
        });

        if (response.ok) {
          storeApproveAction(actionId);
          return true;
        } else {
          throw new Error(`Approval failed: ${response.status}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error approving action:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [deviceToken, pendingApprovals, storeApproveAction]
  );

  // Reject an action
  const rejectAction = useCallback(
    async (actionId: string): Promise<boolean> => {
      if (!deviceToken) return false;

      setIsLoading(true);
      setError(null);

      try {
        const action = pendingApprovals.find((a) => a.id === actionId);
        if (!action) {
          throw new Error("Action not found");
        }

        const response = await fetch(action.rejectUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Device-Token": deviceToken,
          },
          body: JSON.stringify({ token: deviceToken, actionId }),
        });

        if (response.ok) {
          storeRejectAction(actionId);
          return true;
        } else {
          throw new Error(`Rejection failed: ${response.status}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error rejecting action:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [deviceToken, pendingApprovals, storeRejectAction]
  );

  // Auto-refresh pending approvals on mount
  useEffect(() => {
    if (deviceToken) {
      fetchPendingApprovals();
    }
  }, [deviceToken, fetchPendingApprovals]);

  return {
    pendingApprovals,
    history,
    isLoading,
    error,
    fetchPendingApprovals,
    approveAction,
    rejectAction,
  };
}
