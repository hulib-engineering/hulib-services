import { Injectable } from '@nestjs/common';
import { Schedule } from './schedule.interface';
import { mockSchedules } from './mock-data';

@Injectable()
export class ScheduleService {
  private schedules: Schedule[] = mockSchedules;

  getAllSchedules(): Schedule[] {
    return this.schedules;
  }

  getScheduleById(id: string): Schedule | undefined {
    return this.schedules.find((schedule) => schedule.id === id);
  }
}
