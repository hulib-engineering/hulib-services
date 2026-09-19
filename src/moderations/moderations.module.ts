import { Module } from '@nestjs/common';

import { ModerationsController } from './moderations.controller';
import { ModerationsService } from './moderations.service';
import { ModerationRepository } from './moderation.repository';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UsersModule, NotificationsModule, MailModule],
  controllers: [ModerationsController],
  providers: [ModerationsService, ModerationRepository],
  exports: [ModerationsService, ModerationRepository],
})
export class ModerationsModule {}
