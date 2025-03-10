import { Module } from '@nestjs/common';

import { TimeSlotService } from './time-slots.service';
import { TimeSlotController } from './time-slots.controller';
import { RelationalTimeSlotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalTimeSlotPersistenceModule],
  controllers: [TimeSlotController],
  providers: [TimeSlotService],
  exports: [TimeSlotService, RelationalTimeSlotPersistenceModule],
})
export class TimeSlotModule {}
