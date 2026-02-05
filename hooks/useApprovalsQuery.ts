import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveAction,
  fetchPendingApprovals,
  rejectAction,
} from '../lib/api';
import { useApprovalsStore } from '../store/approvalsStore';
import type { ApprovalAction } from '../types';

const QUERY_KEYS = {
  pendingApprovals: (deviceToken: string | null) =>
    ['pendingApprovals', deviceToken] as const,
};

export function useApprovalsQuery(deviceToken: string | null) {
  const queryClient = useQueryClient();
  const {
    setPendingApprovals,
    history,
    approveAction: storeApprove,
    rejectAction: storeReject,
  } = useApprovalsStore();

  const queryKey = useMemo(
    () => QUERY_KEYS.pendingApprovals(deviceToken),
    [deviceToken]
  );

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!deviceToken) {
        return [] as ApprovalAction[];
      }
      return fetchPendingApprovals(deviceToken);
    },
    enabled: !!deviceToken,
    refetchInterval: 30000,
  });

  const pendingApprovals = query.data ?? [];

  useEffect(() => {
    setPendingApprovals(pendingApprovals);
  }, [pendingApprovals, setPendingApprovals]);

  const approveMutation = useMutation({
    mutationFn: async (params: { actionId: string; approveUrl: string }) => {
      if (!deviceToken) throw new Error('No device token');
      await approveAction({
        deviceToken,
        actionId: params.actionId,
        approveUrl: params.approveUrl,
      });
      return params.actionId;
    },
    onSuccess: async (actionId) => {
      storeApprove(actionId);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (params: { actionId: string; rejectUrl: string }) => {
      if (!deviceToken) throw new Error('No device token');
      await rejectAction({
        deviceToken,
        actionId: params.actionId,
        rejectUrl: params.rejectUrl,
      });
      return params.actionId;
    },
    onSuccess: async (actionId) => {
      storeReject(actionId);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    pendingApprovals,
    history,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
    approveAction: async (actionId: string): Promise<boolean> => {
      const action = pendingApprovals.find((a) => a.id === actionId);
      if (!action) return false;

      try {
        await approveMutation.mutateAsync({
          actionId,
          approveUrl: action.approveUrl,
        });
        return true;
      } catch {
        return false;
      }
    },
    rejectAction: async (actionId: string): Promise<boolean> => {
      const action = pendingApprovals.find((a) => a.id === actionId);
      if (!action) return false;

      try {
        await rejectMutation.mutateAsync({
          actionId,
          rejectUrl: action.rejectUrl,
        });
        return true;
      } catch {
        return false;
      }
    },
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
