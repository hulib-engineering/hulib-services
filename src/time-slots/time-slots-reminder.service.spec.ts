import { SCHEDULE_CRON_OPTIONS } from '@nestjs/schedule/dist/schedule.constants';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { TimeSlotReminderService } from './time-slots-reminder.service';

describe('TimeSlotReminderService', () => {
  let service: TimeSlotReminderService;
  let sleepSpy: jest.SpyInstance;
  let prisma: { user: { findMany: jest.Mock } };
  let notificationsService: {
    getAdminId: jest.Mock;
    pushNotiAndWait: jest.Mock;
  };

  beforeEach(() => {
    prisma = { user: { findMany: jest.fn() } };
    notificationsService = {
      getAdminId: jest.fn(),
      pushNotiAndWait: jest.fn(),
    };
    service = new TimeSlotReminderService(
      prisma as never,
      notificationsService as never,
    );
    sleepSpy = jest
      .spyOn(
        service as unknown as { sleep(ms: number): Promise<void> },
        'sleep',
      )
      .mockResolvedValue(undefined);
  });

  describe('sendReminders', () => {
    it('should not scan when no admin account exists', async () => {
      notificationsService.getAdminId.mockResolvedValue(null);

      await expect(service.sendReminders()).resolves.toBe(0);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should send a reminder to active Hubers without time slots', async () => {
      notificationsService.getAdminId.mockResolvedValue(7);
      prisma.user.findMany.mockResolvedValue([{ id: 11 }, { id: 12 }]);
      notificationsService.pushNotiAndWait.mockResolvedValue(true);

      await expect(service.sendReminders()).resolves.toBe(2);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          roleId: RoleEnum.humanBook,
          statusId: StatusEnum.active,
          deletedAt: null,
          timeSlots: { none: {} },
        },
        select: { id: true },
      });
      expect(notificationsService.pushNotiAndWait).toHaveBeenNthCalledWith(1, {
        senderId: 7,
        recipientId: 11,
        type: NotificationTypeEnum.timeSlotReminder,
        extraNote: 'Please set your available meeting time slots.',
      });
      expect(notificationsService.pushNotiAndWait).toHaveBeenNthCalledWith(2, {
        senderId: 7,
        recipientId: 12,
        type: NotificationTypeEnum.timeSlotReminder,
        extraNote: 'Please set your available meeting time slots.',
      });
    });

    it('should continue sending when one notification fails', async () => {
      notificationsService.getAdminId.mockResolvedValue(7);
      prisma.user.findMany.mockResolvedValue([{ id: 11 }, { id: 12 }]);
      notificationsService.pushNotiAndWait
        .mockRejectedValueOnce(new Error('temporary failure'))
        .mockResolvedValueOnce(true);

      await expect(service.sendReminders()).resolves.toBe(1);
      expect(notificationsService.pushNotiAndWait).toHaveBeenCalledTimes(2);
    });

    it('should not count a notification that was not persisted', async () => {
      notificationsService.getAdminId.mockResolvedValue(7);
      prisma.user.findMany.mockResolvedValue([{ id: 11 }]);
      notificationsService.pushNotiAndWait.mockResolvedValue(false);

      await expect(service.sendReminders()).resolves.toBe(0);
    });

    it('should send in batches of ten and wait 30s between them', async () => {
      notificationsService.getAdminId.mockResolvedValue(7);
      prisma.user.findMany.mockResolvedValue(
        Array.from({ length: 25 }, (_, index) => ({ id: index + 1 })),
      );
      notificationsService.pushNotiAndWait.mockResolvedValue(true);

      await expect(service.sendReminders()).resolves.toBe(25);
      expect(notificationsService.pushNotiAndWait).toHaveBeenCalledTimes(25);
      expect(sleepSpy).toHaveBeenCalledTimes(2);
      expect(sleepSpy).toHaveBeenCalledWith(30_000);
    });
  });

  it('should run the scan from the scheduled reminder handler', async () => {
    const sendReminders = jest
      .spyOn(service, 'sendReminders')
      .mockResolvedValue(3);

    await expect(service.handleScheduledReminder()).resolves.toBe(3);
    expect(sendReminders).toHaveBeenCalledTimes(1);
  });

  it('should run at 18:00 Vietnam time on the 10th of every month', () => {
    const cronOptions = Reflect.getMetadata(
      SCHEDULE_CRON_OPTIONS,
      TimeSlotReminderService.prototype.handleScheduledReminder,
    );

    expect(cronOptions).toEqual({
      cronTime: '0 18 10 * *',
      timeZone: 'Asia/Ho_Chi_Minh',
      waitForCompletion: true,
    });
  });
});
