import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotEntity } from '../../../../time-slots/infrastructure/persistence/relational/entities/tims-slot.entity';

@Injectable()
export class TimeSlotSeedService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private repository: Repository<TimeSlotEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      for (let i = 0; i < 7; i++) {
        for (let j = 6; j < 24; j += 0.5) {
          await this.repository.save({
            dayOfWeek: i,
            startTime: j,
          });
        }
      }
    }
  }
}
