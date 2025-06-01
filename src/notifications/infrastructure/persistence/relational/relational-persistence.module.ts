import { Module } from '@nestjs/common';
import { notificationRepository } from '../notification.repository';
import { notificationRelationalRepository } from './repositories/notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { notificationEntity } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([notificationEntity])],
  providers: [
    {
      provide: notificationRepository,
      useClass: notificationRelationalRepository,
    },
  ],
  exports: [notificationRepository],
})
export class RelationalnotificationPersistenceModule {}
