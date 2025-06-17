import { Module } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsHandler } from './notifications.handler';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, NotificationsHandler],
  exports: [NotificationsService, NotificationsHandler],
})
export class NotificationsModule {}
