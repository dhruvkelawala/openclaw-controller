export interface ApprovalAction {
  id: string;
  coin: string;
  action: 'swap' | 'transfer' | 'trade' | 'stake' | 'unstake' | 'other';
  amount: string;
  expiry: number;
  approveUrl: string;
  rejectUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface DeviceRegistration {
  token: string;
  registeredAt: number;
}

export interface NotificationPayload {
  actionId: string;
  coin: string;
  action: string;
  amount: string;
  expiry: number;
  approveUrl: string;
  rejectUrl: string;
}