import { z } from "zod";

/**
 * Schema for approval action types
 */
export const ApprovalActionTypeSchema = z.enum([
  "swap",
  "transfer",
  "trade",
  "stake",
  "unstake",
  "other",
]);

export type ApprovalActionType = z.infer<typeof ApprovalActionTypeSchema>;

/**
 * Schema for approval status
 */
export const ApprovalStatusSchema = z.enum(["pending", "approved", "rejected"]);

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

/**
 * Schema for approval action (pending approval object)
 */
export const ApprovalActionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  coin: z.string().min(1, "Coin is required"),
  action: ApprovalActionTypeSchema,
  amount: z.string().min(1, "Amount is required"),
  expiry: z.number().int().positive("Expiry must be a positive timestamp"),
  approveUrl: z.string().url("Approve URL must be a valid URL"),
  rejectUrl: z.string().url("Reject URL must be a valid URL"),
  status: ApprovalStatusSchema,
  timestamp: z.number().int().positive("Timestamp must be a positive number"),
});

export type ApprovalAction = z.infer<typeof ApprovalActionSchema>;

/**
 * Schema for device registration response
 */
export const DeviceRegistrationResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  message: z.string().optional(),
});

export type DeviceRegistrationResponse = z.infer<typeof DeviceRegistrationResponseSchema>;

/**
 * Schema for device registration request payload
 */
export const DeviceRegistrationPayloadSchema = z.object({
  token: z.string().min(1, "Token is required"),
  pushToken: z.string().optional(),
});

export type DeviceRegistrationPayload = z.infer<typeof DeviceRegistrationPayloadSchema>;

/**
 * Schema for approve API payload
 */
export const ApproveActionPayloadSchema = z.object({
  token: z.string().min(1, "Token is required"),
  actionId: z.string().min(1, "Action ID is required"),
});

export type ApproveActionPayload = z.infer<typeof ApproveActionPayloadSchema>;

/**
 * Schema for reject API payload
 */
export const RejectActionPayloadSchema = z.object({
  token: z.string().min(1, "Token is required"),
  actionId: z.string().min(1, "Action ID is required"),
});

export type RejectActionPayload = z.infer<typeof RejectActionPayloadSchema>;

/**
 * Schema for notification payload from push notifications
 */
export const NotificationPayloadSchema = z.object({
  actionId: z.string().min(1, "Action ID is required"),
  coin: z.string().min(1, "Coin is required"),
  action: z.string().min(1, "Action is required"),
  amount: z.string().min(1, "Amount is required"),
  expiry: z.number().int().positive("Expiry must be a positive timestamp"),
  approveUrl: z.string().url("Approve URL must be a valid URL"),
  rejectUrl: z.string().url("Reject URL must be a valid URL"),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

/**
 * Schema for backend approval item (raw response from /pushcut/status)
 */
export const BackendApprovalItemSchema = z.object({
  actionId: z.string().optional(),
  id: z.string().optional(),
  coin: z.string(),
  action: ApprovalActionTypeSchema,
  amount: z.string(),
  expiry: z.number().int().positive(),
  approveUrl: z.string().url().optional(),
  rejectUrl: z.string().url().optional(),
});

export type BackendApprovalItem = z.infer<typeof BackendApprovalItemSchema>;

/**
 * Schema for API response from approve/reject endpoints
 */
export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  actionId: z.string().optional(),
});

export type ActionResponse = z.infer<typeof ActionResponseSchema>;

/**
 * Schema for pending approvals list response
 */
export const PendingApprovalsResponseSchema = z.array(BackendApprovalItemSchema);

export type PendingApprovalsResponse = z.infer<typeof PendingApprovalsResponseSchema>;
