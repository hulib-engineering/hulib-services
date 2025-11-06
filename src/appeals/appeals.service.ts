import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { ReviewAppealDto } from './dto/review-appeal.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { AppealStatus, ModerationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

@Injectable()
export class AppealsService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: number, createAppealDto: CreateAppealDto) {
    const moderation = await this.prisma.moderation.findUnique({
      where: { id: createAppealDto.moderationId },
    });

    if (!moderation) {
      throw new NotFoundException(
        `Moderation with ID ${createAppealDto.moderationId} not found`,
      );
    }

    if (moderation.userId !== userId) {
      throw new BadRequestException(
        'You can only appeal moderation actions against your own account',
      );
    }

    if (moderation.status === ModerationStatus.reversed) {
      throw new BadRequestException(
        'Cannot appeal a moderation action that has already been reversed',
      );
    }

    const existingAppeal = await this.prisma.appeal.findFirst({
      where: {
        moderationId: createAppealDto.moderationId,
        userId,
      },
    });

    if (existingAppeal) {
      if (existingAppeal.status === AppealStatus.pending) {
        throw new ConflictException(
          'You already have a pending appeal for this moderation action',
        );
      } else if (existingAppeal.status === AppealStatus.rejected) {
        throw new ConflictException(
          'Your appeal for this moderation action has already been rejected. You cannot appeal again.',
        );
      } else if (existingAppeal.status === AppealStatus.accepted) {
        throw new ConflictException(
          'Your appeal for this moderation action has already been accepted',
        );
      }
    }

    const appeal = await this.prisma.appeal.create({
      data: {
        moderationId: createAppealDto.moderationId,
        userId,
        message: createAppealDto.message,
        status: AppealStatus.pending,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    await this.notificationsService.pushNoti({
      senderId: userId,
      recipientId: 1,
      type: NotificationTypeEnum.userAppeal,
      relatedEntityId: appeal.id,
    });

    return appeal;
  }

  async reviewAppeal(appealId: number, reviewDto: ReviewAppealDto) {
    const appeal = await this.prisma.appeal.findUnique({
      where: { id: appealId },
      include: {
        moderation: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!appeal) {
      throw new NotFoundException(`Appeal with ID ${appealId} not found`);
    }

    if (appeal.status !== AppealStatus.pending) {
      throw new BadRequestException(
        `This appeal has already been ${appeal.status}`,
      );
    }

    const updatedAppeal = await this.prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: reviewDto.status,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (reviewDto.status === AppealStatus.accepted) {
      await this.prisma.moderation.update({
        where: { id: appeal.moderationId },
        data: {
          status: ModerationStatus.reversed,
        },
      });
    }

    await this.notificationsService.pushNoti({
      senderId: 1,
      recipientId: appeal.userId,
      type: NotificationTypeEnum.appealResponse,
      relatedEntityId: appealId,
    });

    return updatedAppeal;
  }

  async findOne(appealId: number, userId: number, isAdmin: boolean) {
    const appeal = await this.prisma.appeal.findUnique({
      where: { id: appealId },
      include: {
        moderation: {
          include: {
            report: {
              select: {
                id: true,
                reason: true,
                customReason: true,
              },
            },
          },
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!appeal) {
      throw new NotFoundException(`Appeal with ID ${appealId} not found`);
    }

    if (!isAdmin && appeal.userId !== userId) {
      throw new BadRequestException('You can only view your own appeals');
    }

    return appeal;
  }
}
