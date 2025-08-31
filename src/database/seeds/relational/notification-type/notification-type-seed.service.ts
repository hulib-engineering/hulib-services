import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { NotificationTypeEnum } from '../../../../notifications/notification-type.enum';

@Injectable()
export class NotificationTypeSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const types: NotificationTypeEnum[] = [
      NotificationTypeEnum.sessionRequest,
      NotificationTypeEnum.sessionFinish,
      NotificationTypeEnum.account,
      NotificationTypeEnum.reviewStory,
      NotificationTypeEnum.publishStory,
      NotificationTypeEnum.rejectStory,
      NotificationTypeEnum.huberReported,
      NotificationTypeEnum.rejectHuber,
      NotificationTypeEnum.rejectReadingSession,
      NotificationTypeEnum.approveReadingSession,
      NotificationTypeEnum.cancelReadingSession,
      NotificationTypeEnum.missReadingSession,
      NotificationTypeEnum.other,
    ];
    const res = await this.prisma.notificationType.createMany({
      data: types.map((name) => ({ name })),
      skipDuplicates: true,
    });

    if (res.count > 0) {
      console.log(`✅ Created ${res.count} new notification types`);
    } else {
      console.log('ℹ️ All notification types already exist');
    }
  }
}
