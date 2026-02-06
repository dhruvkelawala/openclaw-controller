import { z } from 'zod';

export const ActionTypeSchema = z.enum([
  'swap',
  'transfer',
  'trade',
  'stake',
  'unstake',
  'other',
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const StatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type Status = z.infer<typeof StatusSchema>;

export const ApprovalActionSchema = z.object({
  id: z.string(),
  coin: z.string(),
  action: ActionTypeSchema,
  amount: z.string(),
  expiry: z.number(),
  approveUrl: z.string().url(),
  rejectUrl: z.string().url(),
  status: StatusSchema,
  timestamp: z.number(),
});
export type ApprovalAction = z.infer<typeof ApprovalActionSchema>;

export const PendingApprovalItemSchema = z.object({
  actionId: z.string().optional(),
  id: z.string().optional(),
  coin: z.string(),
  action: z.string(),
  amount: z.string(),
  expiry: z.number(),
  approveUrl: z.string().url().optional(),
  rejectUrl: z.string().url().optional(),
});

export const PendingApprovalsResponseSchema = z.array(PendingApprovalItemSchema);

export const NotificationPayloadSchema = z.object({
  actionId: z.string(),
  coin: z.string(),
  action: z.string(),
  amount: z.string(),
  expiry: z.number(),
  approveUrl: z.string().url(),
  rejectUrl: z.string().url(),
});
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

export const DeviceRegistrationSchema = z.object({
  token: z.string(),
  registeredAt: z.number(),
});
export type DeviceRegistration = z.infer<typeof DeviceRegistrationSchema>;
