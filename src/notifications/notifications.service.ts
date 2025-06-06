import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PrismaService } from '../prisma-client/prisma-client.service';
import { FindQueryNotificationsDto } from './dto/find-all-notifications-query.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationTypeEnum } from './notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAllWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions: FindQueryNotificationsDto;
    paginationOptions: IPaginationOptions;
  }) {
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const take = paginationOptions.limit;
    return this.prisma.notification.findMany({
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
        relatedEntity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      omit: {
        typeId: true,
        recipientId: true,
        senderId: true,
        relatedEntityId: true,
      },
      skip,
      take,
    });
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

    const storyNotificationTypes: string[] = [
      NotificationTypeEnum.reviewStory,
      NotificationTypeEnum.publishStory,
    ];

    const isStoryNotificationType = storyNotificationTypes.includes(type.name);

    if (isStoryNotificationType && !data.relatedEntityId) {
      throw new BadRequestException('Related entity ID is required');
    }

    return await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        typeId: type.id,
        relatedEntityId: data.relatedEntityId ?? null,
      },
    });
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
