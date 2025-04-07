export interface TrackingEvent {
  name: string;
  userId?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}
