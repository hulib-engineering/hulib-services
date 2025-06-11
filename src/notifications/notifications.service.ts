import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PrismaService } from '../prisma-client/prisma-client.service';
import { FindQueryNotificationsDto } from './dto/find-all-notifications-query.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationTypeEnum } from './notification-type.enum';

@Injectable()
export class NotificationsService {
  private readonly storyRelatedNotificationTypes: string[] = [
    NotificationTypeEnum.reviewStory,
    NotificationTypeEnum.publishStory,
  ];

  constructor(private prisma: PrismaService) {}

  async findAllWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions: FindQueryNotificationsDto;
    paginationOptions: IPaginationOptions;
  }) {
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;
    const notifications = await this.prisma.notification.findMany({
      where: {
        ...filterOptions,
      },
      include: {
        type: true,
        recipient: {
          select: {
            id: true,
            fullName: true,
            file: {
              select: {
                path: true,
              },
            },
          },
        },
        sender: {
          select: {
            id: true,
            fullName: true,
            file: {
              select: {
                path: true,
              },
            },
          },
        },
      },
      omit: {
        typeId: true,
        recipientId: true,
        senderId: true,
      },
      skip,
      take,
    });

    const storyRelatedNotifications = notifications.filter(
      (n) =>
        this.storyRelatedNotificationTypes.includes(n.type.name) &&
        n.relatedEntityId !== null,
    );

    const storyIds = storyRelatedNotifications
      .map((n) => n.relatedEntityId)
      .filter((id): id is number => id !== null);

    let storyMap = new Map();
    if (storyIds.length > 0) {
      const stories = await this.prisma.story.findMany({
        where: { id: { in: storyIds } },
        select: {
          id: true,
          title: true,
        },
      });
      storyMap = new Map(stories.map((s) => [s.id, s]));
    }

    const result = notifications.map((n) => {
      if (this.storyRelatedNotificationTypes.includes(n.type.name)) {
        return {
          ...n,
          relatedEntity:
            n.relatedEntityId !== null
              ? storyMap.get(n.relatedEntityId) || null
              : null,
        };
      }
      return { ...n, relatedEntity: null };
    });
    return result;
  }

  async create(data: CreateNotificationDto) {
    if (data.recipientId === data.senderId) {
      throw new BadRequestException(
        'senderId and recipientId must be different',
      );
    }
    const type = await this.prisma.notificationType.findUnique({
      where: {
        name: data.type,
      },
    });

    if (!type) {
      throw new BadRequestException('Invalid Notification Type');
    }

    const isStoryNotificationType = this.storyRelatedNotificationTypes.includes(
      type.name,
    );

    const isSessionRequestNotificationType =
      type.name === NotificationTypeEnum.sessionRequest;

    const isNeedRelatedEntityId =
      isStoryNotificationType || isSessionRequestNotificationType;

    if (isNeedRelatedEntityId && !data.relatedEntityId) {
      throw new BadRequestException('Related entity ID is required');
    }

    if (data.relatedEntityId) {
      await this.verifyRelatedEntityId(type.name, data.relatedEntityId);
    }

    return await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        typeId: type.id,
        relatedEntityId: isNeedRelatedEntityId ? data.relatedEntityId : null,
      },
    });
  }

  private async verifyRelatedEntityId(
    notificationType: string,
    relatedEntityId: number,
  ): Promise<void> {
    if (this.storyRelatedNotificationTypes.includes(notificationType)) {
      const story = await this.prisma.story.findUnique({
        where: {
          id: relatedEntityId,
        },
      });

      if (!story) {
        throw new BadRequestException('Invalid story ID');
      }
    }
    if (notificationType === NotificationTypeEnum.sessionRequest) {
      const readingSession = await this.prisma.readingSession.findUnique({
        where: {
          id: relatedEntityId,
          deletedAt: null,
        },
      });

      if (!readingSession) {
        throw new BadRequestException('Invalid reading session ID');
      }
    }
  }

  async updateSeenNotification({
    id,
    recipientId,
  }: {
    id: number;
    recipientId: number;
  }) {
    await this.prisma.notification.update({
      where: {
        id,
        recipientId,
      },
      data: {
        seen: true,
      },
    });

    return {
      message: 'Update notification successfully',
    };
  }
}
