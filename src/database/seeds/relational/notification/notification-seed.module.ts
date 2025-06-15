import { Module } from '@nestjs/common';
import { NotificationSeedService } from './notification-seed.service';

@Module({
  providers: [NotificationSeedService],
  exports: [NotificationSeedService],
})
export class NotificationSeedModule {}
