import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApprovalAction, ApprovalActionSchema } from "../schemas";

interface ApprovalsState {
  pendingApprovals: ApprovalAction[];
  history: ApprovalAction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setPendingApprovals: (approvals: ApprovalAction[]) => void;
  addPendingApproval: (approval: ApprovalAction) => void;
  approveAction: (id: string) => void;
  rejectAction: (id: string) => void;
  moveToHistory: (id: string, status: "approved" | "rejected") => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useApprovalsStore = create<ApprovalsState>()(
  persist(
    (set, get) => ({
      pendingApprovals: [],
      history: [],
      isLoading: false,
      error: null,

      setPendingApprovals: (approvals) => {
        // Validate all approvals before setting
        const validatedApprovals = approvals.filter((approval) => {
          const result = ApprovalActionSchema.safeParse(approval);
          if (!result.success) {
            console.warn("Invalid approval in setPendingApprovals:", result.error);
            return false;
          }
          return true;
        });
        set({ pendingApprovals: validatedApprovals });
      },

      addPendingApproval: (approval) => {
        // Validate the approval before adding
        const result = ApprovalActionSchema.safeParse(approval);
        if (!result.success) {
          console.error("Invalid approval in addPendingApproval:", result.error);
          return;
        }

        set((state) => ({
          pendingApprovals: [
            result.data,
            ...state.pendingApprovals.filter((a) => a.id !== result.data.id),
          ],
        }));
      },

      approveAction: (id) => {
        get().moveToHistory(id, "approved");
      },

      rejectAction: (id) => {
        get().moveToHistory(id, "rejected");
      },

      moveToHistory: (id, status) => {
        set((state) => {
          const action = state.pendingApprovals.find((a) => a.id === id);
          if (!action) return state;

          const updatedAction = { ...action, status };

          // Validate the updated action
          const result = ApprovalActionSchema.safeParse(updatedAction);
          if (!result.success) {
            console.error("Invalid action in moveToHistory:", result.error);
            return state;
          }

          return {
            pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
            history: [result.data, ...state.history],
          };
        });
      },

      clearHistory: () => set({ history: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "approvals-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
