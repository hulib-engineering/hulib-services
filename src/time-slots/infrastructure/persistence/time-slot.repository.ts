import { NullableType } from '@utils/types/nullable.type';

import { TimeSlot } from '../../domain/time-slot';

export abstract class TimeSlotRepository {
  abstract create(
    data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TimeSlot>;

  abstract findAll(): Promise<TimeSlot[]>;

  abstract findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>>;

  abstract findByTime(
    dayOfWeek: TimeSlot['dayOfWeek'],
    startTime: TimeSlot['startTime'],
  ): Promise<NullableType<TimeSlot>>;

  abstract remove(id: TimeSlot['id']): Promise<void>;

  abstract update(data: TimeSlot): Promise<TimeSlot>;

  abstract findByDayOfWeek(
    dayOfWeek: TimeSlot['dayOfWeek'],
  ): Promise<TimeSlot[]>;
}
