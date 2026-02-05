// Re-export all types from schemas for backwards compatibility
export type {
  ApprovalAction,
  ActionType,
  Status,
  NotificationPayload,
  DeviceRegistration,
} from '../lib/schemas';

export {
  ApprovalActionSchema,
  ActionTypeSchema,
  StatusSchema,
  NotificationPayloadSchema,
  DeviceRegistrationSchema,
  PendingApprovalsResponseSchema,
} from '../lib/schemas';
