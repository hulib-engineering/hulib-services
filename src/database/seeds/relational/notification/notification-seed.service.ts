import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class NotificationSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const notificationCount = await this.prisma.notification.count();

    if (notificationCount < 20) {
      const [notificationTypeList, userList, storyList] = await Promise.all([
        this.prisma.notificationType.findMany({}),
        this.prisma.user.findMany({}),
        this.prisma.story.findMany({}),
      ]);

      const notificationTypeIds = notificationTypeList.map((item) => item.id);
      const storyNotificationTypeMap = notificationTypeList.reduce(
        (acc, item) => {
          if (item.name === 'reviewStory' || item.name === 'publishStory') {
            acc[`${item.id}`] = item.id;
          }
          return acc;
        },
        {},
      );

      const userIds = userList.map((user) => user.id);
      const storyIds = storyList.map((story) => story.id);

      const notifications = [...Array(20)].map(() => {
        const typeId = faker.helpers.arrayElement(notificationTypeIds);
        const storyId = faker.helpers.arrayElement(storyIds);
        const recipientId = faker.helpers.arrayElement(userIds);
        const possibleSenderIds = userIds.filter((id) => id !== recipientId);
        const senderId = faker.helpers.arrayElement(possibleSenderIds);
        return {
          recipientId,
          senderId,
          typeId,
          seen: faker.helpers.arrayElement([true, false]),
          relatedEntityId: storyNotificationTypeMap[String(typeId)]
            ? storyId
            : null,
        };
      });

      const res = await this.prisma.notification.createMany({
        data: notifications,
      });

      console.log(`✅ Created ${res.count} notifications`);
    }
  }
}
