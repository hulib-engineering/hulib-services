import { Module } from '@nestjs/common';
import { SchedulesEntity } from './entities/schedules.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesRepository } from '../schedules.repository';
import { SchedulesRelationalRepository } from './repositories/schedules.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SchedulesEntity])],

  providers: [
    {
      provide: SchedulesRepository,
      useClass: SchedulesRelationalRepository,
    },
  ],
  exports: [SchedulesRepository],
})
export class RelationalSchedulesPersistenceModule {}
