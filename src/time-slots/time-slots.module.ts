import { Module } from '@nestjs/common';

import { TimeSlotService } from './time-slots.service';
import { TimeSlotController } from './time-slots.controller';
import { RelationalTimeSlotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RelationalTimeSlotPersistenceModule, UsersModule],
  controllers: [TimeSlotController],
  providers: [TimeSlotService],
  exports: [TimeSlotService, RelationalTimeSlotPersistenceModule],
})
export class TimeSlotModule {}
