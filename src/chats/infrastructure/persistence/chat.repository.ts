import { NullableType } from '@utils/types/nullable.type';

import { Chat } from '../../domain/chat';
import { User } from '../../../users/domain/user';

export abstract class ChatRepository {
  abstract create(
    data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>,
    user: User,
  ): Promise<Chat>;

  abstract createMany(
    data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>[],
    user: User,
  ): Promise<Chat[]>;

  abstract findAll(): Promise<Chat[]>;

  abstract findById(id: Chat['id']): Promise<NullableType<Chat>>;

  abstract findByTime(
    dayOfWeek: Chat['dayOfWeek'],
    startTime: Chat['startTime'],
  ): Promise<NullableType<Chat>>;

  abstract findByUser(huberId: User['id']): Promise<Chat[]>;

  abstract remove(id: Chat['id']): Promise<void>;

  abstract update(data: Chat): Promise<Chat>;

  abstract findByDayOfWeek(
    dayOfWeek: Chat['dayOfWeek'],
  ): Promise<Chat[]>;
}
