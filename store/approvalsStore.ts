import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApprovalAction } from '../types';

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
  moveToHistory: (id: string, status: 'approved' | 'rejected') => void;
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

      setPendingApprovals: (approvals) => set({ pendingApprovals: approvals }),
      
      addPendingApproval: (approval) => 
        set((state) => ({
          pendingApprovals: [approval, ...state.pendingApprovals.filter(a => a.id !== approval.id)],
        })),
      
      approveAction: (id) => {
        get().moveToHistory(id, 'approved');
      },
      
      rejectAction: (id) => {
        get().moveToHistory(id, 'rejected');
      },
      
      moveToHistory: (id, status) => {
        set((state) => {
          const action = state.pendingApprovals.find(a => a.id === id);
          if (!action) return state;
          
          const updatedAction = { ...action, status };
          return {
            pendingApprovals: state.pendingApprovals.filter(a => a.id !== id),
            history: [updatedAction, ...state.history],
          };
        });
      },
      
      clearHistory: () => set({ history: [] }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'approvals-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);