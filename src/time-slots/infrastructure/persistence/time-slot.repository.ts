import { NullableType } from '@utils/types/nullable.type';

import { TimeSlot } from '../../domain/time-slot';
import { User } from '../../../users/domain/user';

export abstract class TimeSlotRepository {
  abstract create(
    data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>,
    user: User,
  ): Promise<TimeSlot>;

  abstract createMany(
    data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>[],
    user: User,
  ): Promise<TimeSlot[]>;

  abstract findAll(): Promise<TimeSlot[]>;

  abstract findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>>;

  abstract findByTime(
    dayOfWeek: TimeSlot['dayOfWeek'],
    startTime: TimeSlot['startTime'],
  ): Promise<NullableType<TimeSlot>>;

  abstract findByUser(huberId: User['id']): Promise<TimeSlot[]>;

  abstract remove(id: TimeSlot['id']): Promise<void>;

  abstract update(data: TimeSlot): Promise<TimeSlot>;

  abstract findByDayOfWeek(
    dayOfWeek: TimeSlot['dayOfWeek'],
  ): Promise<TimeSlot[]>;
}
