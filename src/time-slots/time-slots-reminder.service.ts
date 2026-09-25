import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TimeSlotReminderService {
  private readonly logger = new Logger(TimeSlotReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendReminders(): Promise<number> {
    const adminId = await this.notificationsService.getAdminId();
    if (!adminId) {
      this.logger.warn('Time slot reminder skipped: no admin account found');
      return 0;
    }

    const hubers = await this.prisma.user.findMany({
      where: {
        roleId: RoleEnum.humanBook,
        statusId: StatusEnum.active,
        deletedAt: null,
        timeSlots: { none: {} },
      },
      select: { id: true },
    });

    let sentCount = 0;

    for (const huber of hubers) {
      try {
        const sent = await this.notificationsService.pushNotiAndWait({
          senderId: adminId,
          recipientId: huber.id,
          type: NotificationTypeEnum.timeSlotReminder,
          extraNote: 'Please set your available meeting time slots.',
        });

        if (sent) {
          sentCount += 1;
        }
      } catch (error) {
        this.logger.error(
          `Failed to send time slot reminder to user ${huber.id}: ${error.message}`,
        );
      }
    }

    return sentCount;
  }
}
