import { Module } from '@nestjs/common';

import { TimeSlotRepository } from '../time-slot.repository';
import { TimeSlotRepositoryImplement } from './repositories/time-slot-prisma.repository';

@Module({
  providers: [
    {
      provide: TimeSlotRepository,
      useClass: TimeSlotRepositoryImplement,
    },
  ],
  exports: [TimeSlotRepository],
})
export class RelationalTimeSlotPersistenceModule {}
