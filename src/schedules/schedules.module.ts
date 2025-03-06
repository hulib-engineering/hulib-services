import { Module } from '@nestjs/common';
import { RelationalSchedulesPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';
import { PrismaService } from '../prisma-client/prisma-client.service';

@Module({
  imports: [RelationalSchedulesPersistenceModule, SchedulesModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService],
  exports: [ScheduleService, RelationalSchedulesPersistenceModule],
})
export class SchedulesModule {}
