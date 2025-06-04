import { Module } from '@nestjs/common';
import { NotificationTypeSeedService } from './notification-type-seed.service';

@Module({
  providers: [NotificationTypeSeedService],
  exports: [NotificationTypeSeedService],
})
export class NotificationTypeSeedModule {}
