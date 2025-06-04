import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class NotificationTypeSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const types = [
      'sessionRequest',
      'account',
      'reviewStory',
      'publishStory',
      'other',
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
