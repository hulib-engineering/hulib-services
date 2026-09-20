import { Module } from '@nestjs/common';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';
import { PrismaService } from '../prisma-client/prisma-client.service';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService],
  exports: [ScheduleService],
})
export class SchedulesModule {}
