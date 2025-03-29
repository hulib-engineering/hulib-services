import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TimeSlotSeedService } from './time-slot-seed.service';
import { TimeSlotEntity } from '../../../../time-slots/infrastructure/persistence/relational/entities/tims-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlotEntity])],
  providers: [TimeSlotSeedService],
  exports: [TimeSlotSeedService],
})
export class TimeSlotSeedModule {}
