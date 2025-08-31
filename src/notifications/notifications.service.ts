import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { infinityPagination } from '@utils/infinity-pagination';
import { IPaginationOptions } from '@utils/types/pagination-options';

import { FindQueryNotificationsDto } from './dto/find-all-notifications-query.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationTypeEnum } from './notification-type.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(this.constructor.name);

  private readonly storyRelatedNotificationTypes: string[] = [
    NotificationTypeEnum.reviewStory,
    NotificationTypeEnum.publishStory,
    NotificationTypeEnum.rejectStory,
  ];
  private readonly readingSessionRelatedNotiTypes: string[] = [
    NotificationTypeEnum.sessionRequest,
    NotificationTypeEnum.sessionFinish,
    NotificationTypeEnum.approveReadingSession,
    NotificationTypeEnum.rejectReadingSession,
    NotificationTypeEnum.cancelReadingSession,
    NotificationTypeEnum.missReadingSession,
    NotificationTypeEnum.other,
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
          this.readingSessionRelatedNotiTypes.includes(n.type.name) &&
          n.relatedEntityId !== null,
      )
      .map((n) => n.relatedEntityId)
      .filter((id): id is number => id !== null);

    const reportIds = notifications
      .filter(
        (n) =>
          n.type.name === NotificationTypeEnum.huberReported &&
          n.relatedEntityId !== null,
      )
      .map((n) => n.relatedEntityId)
      .filter((id): id is number => id !== null);

    const [stories, readingSessions, reports] = await Promise.all([
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
          startedAt: true,
          startTime: true,
          endTime: true,
          rejectReason: true,
          sessionUrl: true,
          story: {
            select: {
              title: true,
            },
          },
          humanBook: {
            select: {
              id: true,
              fullName: true,
            },
          },
          reader: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.report.findMany({
        where: { id: { in: reportIds } },
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
          rejectionReason: s.rejectionReason,
        },
      ]),
    );

    const readingSessionMap = new Map(
      readingSessions.map((rs) => [
        rs.id,
        {
          id: rs.id,
          sessionStatus: rs.sessionStatus,
          startedAt: rs.startedAt,
          startTime: rs.startTime,
          endTime: rs.endTime,
          rejectReason: rs.rejectReason,
          storyTitle: rs.story.title,
          humanBook: rs.humanBook,
          reader: rs.reader,
          sessionUrl: rs.sessionUrl,
        },
      ]),
    );

    const reportMap = new Map(
      reports.map((rs) => [
        rs.id,
        {
          id: rs.id,
          reason: rs.reason,
          reporterId: rs.reporterId,
          reportedUserId: rs.reportedUserId,
          markAsResolved: rs.markAsResolved,
        },
      ]),
    );

    const result = notifications.map((n) => {
      const recipient = this.mapUserWithPhoto(n.recipient);
      const sender = this.mapUserWithPhoto(n.sender);

      let relatedEntity: any = null;

      if (this.storyRelatedNotificationTypes.includes(n.type.name)) {
        relatedEntity =
          n.relatedEntityId !== null
            ? storyMap.get(n.relatedEntityId) || null
            : null;
      } else if (this.readingSessionRelatedNotiTypes.includes(n.type.name)) {
        relatedEntity =
          n.relatedEntityId !== null
            ? readingSessionMap.get(n.relatedEntityId) || null
            : null;
      } else if (n.type.name === NotificationTypeEnum.huberReported) {
        relatedEntity =
          n.relatedEntityId !== null
            ? reportMap.get(n.relatedEntityId) || null
            : null;
      }

      return {
        ...n,
        recipient,
        sender,
        relatedEntity,
      };
    });
    return {
      data: result,
      unseenCount,
    };
  }

  private mapUserWithPhoto<T extends { file?: any }>(user: T | null) {
    if (!user) return null;
    const { file, ...rest } = user;
    return { ...rest, photo: file };
  }

  async create(data: CreateNotificationDto) {
    try {
      if (data.recipientId === data.senderId) {
        this.logger.warn(
          'Notification skipped: senderId and recipientId must be different',
        );
        return null;
      }

      const type = await this.prisma.notificationType.findUnique({
        where: { name: data.type },
      });

      if (!type) {
        this.logger.warn(
          `Notification skipped: Invalid Notification Type (${data.type})`,
        );
        return null;
      }

      const isStoryNotificationType =
        this.storyRelatedNotificationTypes.includes(type.name);
      const isReadingSessionRelatedNotiType =
        this.readingSessionRelatedNotiTypes.includes(type.name);
      const isHuberReportNotiType =
        type.name === NotificationTypeEnum.huberReported;

      const isNeedRelatedEntityId =
        isStoryNotificationType ||
        isReadingSessionRelatedNotiType ||
        isHuberReportNotiType;

      if (isNeedRelatedEntityId && !data.relatedEntityId) {
        this.logger.warn(
          `Notification skipped: Related entity ID is required for type ${type.name}`,
        );
        return null;
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
          extraNote: data.extraNote,
        },
      });
    } catch (error) {
      this.logger.error(`Notification creation failed: ${error.message}`);
      return null;
    }
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
    if (this.readingSessionRelatedNotiTypes.includes(notificationType)) {
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
    if (notificationType === NotificationTypeEnum.huberReported) {
      const report = await this.prisma.report.findUnique({
        where: {
          id: relatedEntityId,
        },
      });

      if (!report) {
        throw new BadRequestException('Invalid report ID');
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
