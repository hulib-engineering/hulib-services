import { Chat } from './chat';
import { User } from '@users/domain/user';

export class Conversation {
  recipient: User;

  last_message: Chat;

  isUnread: boolean;

  unreadCount: number;

  isOnline: boolean;

  constructoṛ() {}
}
