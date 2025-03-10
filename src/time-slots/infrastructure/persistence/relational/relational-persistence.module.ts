import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TimeSlotRepository } from '../time-slot.repository';
import { TimeSlotRelationalRepository } from './repositories/time-slot.repository';
import { TimeSlotEntity } from './entities/tims-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlotEntity])],

  providers: [
    {
      provide: TimeSlotRepository,
      useClass: TimeSlotRelationalRepository,
    },
  ],
  exports: [TimeSlotRepository],
})
export class RelationalTimeSlotPersistenceModule {}
