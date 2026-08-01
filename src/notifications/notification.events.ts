export enum NotificationEvent {
  Create = 'notification.create',
  ListFetch = 'notification.list.fetch',
}

export interface NotificationListPayload {
  // Rows carry extra joined fields (recipient, sender, type, relatedEntity...)
  // beyond the thin `Notification` domain class, so keep this structural.
  data: Record<string, unknown>[];
  hasNextPage: boolean;
  unseenCount: number;
}

export interface NotificationListFetchEvent {
  userId: number;
  notifications: NotificationListPayload;
}
