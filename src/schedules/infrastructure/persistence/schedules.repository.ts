import { SchedulesEntity } from './relational/entities/schedules.entity';

export abstract class SchedulesRepository {
  abstract findMany(): Promise<SchedulesEntity[]>;
}
