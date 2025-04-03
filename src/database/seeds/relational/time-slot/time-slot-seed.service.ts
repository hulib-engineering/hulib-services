import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotEntity } from '@time-slots/infrastructure/persistence/relational/entities/tims-slot.entity';

@Injectable()
export class TimeSlotSeedService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private repository: Repository<TimeSlotEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      for (let i = 0; i < 7; i++) {
        for (let j = 6; j < 24; j += 0.5) {
          const hours = Math.floor(j);
          const minutes = (j % 1) * 60;

          const timeString = `${String(hours).padStart(2, '0')}:${String(Math.round(minutes)).padStart(2, '0')}:00`;

          await this.repository.save({
            huberId: 2,
            dayOfWeek: i,
            startTime: timeString,
          });
        }
      }
    }
  }
}
