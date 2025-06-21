import { NullableType } from '@utils/types/nullable.type';

import { Chat } from '../../domain/chat';
import { User } from '../../../users/domain/user';

export abstract class ChatRepository {
  abstract create(
    data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>,
    sender: User,
    recipient: User,
  ): Promise<Chat>;

  abstract findByUser(huberId: User['id']): Promise<Chat[]>;

  abstract findByUsers(user1: User['id'], user2: User['id']): Promise<Chat[]>;

  abstract findById(id: Chat['id']): Promise<NullableType<Chat>>;

  abstract update(data: Chat): Promise<Chat>;
}
