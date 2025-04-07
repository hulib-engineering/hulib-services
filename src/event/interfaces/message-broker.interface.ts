export interface MessageBroker {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(topic: string, messages: any[]): Promise<void>;
}
