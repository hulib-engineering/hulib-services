import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { processInBatches } from '@utils/process-in-batches';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';

const TIME_SLOT_REMINDER_CRON = '0 18 5,10,15,20,25,30 * *';
const REMINDER_BATCH_SIZE = 10;
const REMINDER_BATCH_DELAY_MS = 30_000;

@Injectable()
export class TimeSlotReminderService {
  private readonly logger = new Logger(TimeSlotReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(TIME_SLOT_REMINDER_CRON, {
    timeZone: 'Asia/Ho_Chi_Minh',
    waitForCompletion: true,
  })
  async handleScheduledReminder(): Promise<number> {
    return this.sendReminders();
  }

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

    const result = await processInBatches(
      hubers,
      (huber) => this.sendReminder(adminId, huber.id),
      {
        batchSize: REMINDER_BATCH_SIZE,
        delayMs: REMINDER_BATCH_DELAY_MS,
        sleep: (ms) => this.sleep(ms),
        onItemError: (error, huber) =>
          this.logger.error(
            `Failed to send time slot reminder to user ${huber.id}: ${(error as Error).message}`,
          ),
      },
    );

    this.logger.log(
      `Time slot reminder scan finished: ${result.succeeded.length} sent, ${result.failed} failed`,
    );

    return result.succeeded.length;
  }

  private async sendReminder(
    senderId: number,
    recipientId: number,
  ): Promise<boolean> {
    const sent = await this.notificationsService.pushNotiAndWait({
      senderId,
      recipientId,
      type: NotificationTypeEnum.timeSlotReminder,
      extraNote: 'Please set your available meeting time slots.',
    });

    if (!sent) {
      throw new Error('Notification was not persisted');
    }

    return sent;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
