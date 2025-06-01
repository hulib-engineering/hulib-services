import { Module } from '@nestjs/common';
import { notificationsService } from './notifications.service';
import { notificationsController } from './notifications.controller';
import { RelationalnotificationPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalnotificationPersistenceModule],
  controllers: [notificationsController],
  providers: [notificationsService],
  exports: [notificationsService, RelationalnotificationPersistenceModule],
})
export class NotificationsModule {}
