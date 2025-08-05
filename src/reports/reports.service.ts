import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '../roles/roles.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(reporterId: number, createReportDto: CreateReportDto) {
    const { reportedUserId, reason } = createReportDto;

    if (reporterId === reportedUserId) {
      throw new BadRequestException('You cannot report yourself');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: reportedUserId, roleId: RoleEnum.humanBook },
    });

    if (!reportedUser) {
      throw new NotFoundException('Huber not found');
    }

    const existingReport = await this.prisma.report.findUnique({
      where: {
        reporterId_reportedUserId: {
          reporterId,
          reportedUserId,
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this Huber');
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
      },
      include: {
        reporter: {
          select: { id: true, fullName: true, email: true },
        },
        reportedUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
      omit: {
        reporterId: true,
        reportedUserId: true,
      },
    });

    await this.notificationsService.pushNoti({
      senderId: reporterId,
      recipientId: 1,
      type: NotificationTypeEnum.huberReported,
      relatedEntityId: report.id,
    });

    return report;
  }
}
