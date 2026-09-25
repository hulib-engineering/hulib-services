import { Module } from '@nestjs/common';

import { TimeSlotService } from './time-slots.service';
import { TimeSlotController } from './time-slots.controller';
import { TimeSlotRepository } from './time-slot.repository';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TimeSlotReminderService } from './time-slots-reminder.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [TimeSlotController],
  providers: [
    TimeSlotService,
    TimeSlotRepository,
    TimeSlotReminderService,
  ],
  exports: [TimeSlotService, TimeSlotRepository, TimeSlotReminderService],
})
export class TimeSlotModule {}
