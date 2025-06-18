import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PrismaService } from '../prisma-client/prisma-client.service';
import { FindQueryNotificationsDto } from './dto/find-all-notifications-query.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationTypeEnum } from './notification-type.enum';
import { infinityPagination } from '@utils/infinity-pagination';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly storyRelatedNotificationTypes: string[] = [
    NotificationTypeEnum.reviewStory,
    NotificationTypeEnum.publishStory,
  ];

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAllWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions: FindQueryNotificationsDto;
    paginationOptions: IPaginationOptions;
  }) {
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;
    const [unseenCount, notifications] = await this.prisma.$transaction([
      this.prisma.notification.count({
        where: {
          recipientId: filterOptions.recipientId,
          seen: false,
        },
      }),
      this.prisma.notification.findMany({
        where: {
          ...filterOptions,
        },
        orderBy: {
          createdAt: 'desc',
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
      }),
    ]);

    const storyIds = notifications
      .filter(
        (n) =>
          this.storyRelatedNotificationTypes.includes(n.type.name) &&
          n.relatedEntityId !== null,
      )
      .map((n) => n.relatedEntityId)
      .filter((id): id is number => id !== null);

    const readingSessionIds = notifications
      .filter(
        (n) =>
          n.type.name === NotificationTypeEnum.sessionRequest &&
          n.relatedEntityId !== null,
      )
      .map((n) => n.relatedEntityId)
      .filter((id): id is number => id !== null);

    const [stories, readingSessions] = await Promise.all([
      this.prisma.story.findMany({
        where: { id: { in: storyIds } },
        include: {
          storyReview: {
            where: {
              rating: { gt: 0 },
            },
          },
        },
      }),
      this.prisma.readingSession.findMany({
        where: { id: { in: readingSessionIds } },
        select: {
          id: true,
          sessionStatus: true,
        },
      }),
    ]);

    const storyMap = new Map(
      stories.map((s) => [
        s.id,
        {
          id: s.id,
          title: s.title,
          numOfRatings: s.storyReview.length,
          numOfComments: s.storyReview.length,
        },
      ]),
    );

    const readingSessionMap = new Map(
      readingSessions.map((rs) => [
        rs.id,
        {
          id: rs.id,
          sessionStatus: rs.sessionStatus,
        },
      ]),
    );

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
      if (n.type.name === NotificationTypeEnum.sessionRequest) {
        return {
          ...n,
          relatedEntity:
            n.relatedEntityId !== null
              ? readingSessionMap.get(n.relatedEntityId) || null
              : null,
        };
      }
      return { ...n, relatedEntity: null };
    });
    return {
      data: result,
      unseenCount,
    };
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

    return this.prisma.notification.create({
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

  async pushNoti(createNotificationDto: CreateNotificationDto) {
    const notification = await this.create(createNotificationDto);

    if (notification) {
      const refetchedNotifs = await this.findAllWithPagination({
        filterOptions: { recipientId: notification.recipientId },
        paginationOptions: { page: 1, limit: 5 },
      });

      this.eventEmitter.emit('notification.list.fetch', {
        userId: notification.recipientId,
        notifications: {
          ...refetchedNotifs,
          ...infinityPagination(refetchedNotifs.data, { page: 1, limit: 5 }),
        },
      });
    }
  }
}
