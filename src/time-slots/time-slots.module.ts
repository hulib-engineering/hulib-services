import { Module } from '@nestjs/common';

import { TimeSlotService } from './time-slots.service';
import { TimeSlotController } from './time-slots.controller';
import { TimeSlotRepository } from './time-slot.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TimeSlotController],
  providers: [TimeSlotService, TimeSlotRepository],
  exports: [TimeSlotService, TimeSlotRepository],
})
export class TimeSlotModule {}