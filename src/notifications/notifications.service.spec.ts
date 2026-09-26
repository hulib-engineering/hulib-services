import { NotificationsService } from './notifications.service';
import { NotificationTypeEnum } from './notification-type.enum';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: { create: jest.Mock };
    story: { findUnique: jest.Mock };
    readingSession: { findUnique: jest.Mock };
    appeal: { findUnique: jest.Mock };
    report: { findUnique: jest.Mock };
    moderation: { findUnique: jest.Mock };
  };
  let eventEmitter: { emit: jest.Mock };

  beforeEach(() => {
    prisma = {
      notification: { create: jest.fn() },
      story: { findUnique: jest.fn() },
      readingSession: { findUnique: jest.fn() },
      appeal: { findUnique: jest.fn() },
      report: { findUnique: jest.fn() },
      moderation: { findUnique: jest.fn() },
    };
    eventEmitter = { emit: jest.fn() };
    service = new NotificationsService(prisma as never, eventEmitter as never);
  });

  describe('create', () => {
    it('should create a notification without the legacy typeId_backup field', async () => {
      const created = { id: 1, notificationType: NotificationTypeEnum.account };
      prisma.notification.create.mockResolvedValue(created);

      const result = await service.create({
        recipientId: 2,
        senderId: 1,
        type: NotificationTypeEnum.account,
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          recipientId: 2,
          senderId: 1,
          notificationType: NotificationTypeEnum.account,
          relatedEntityId: null,
          extraNote: undefined,
        },
      });
      const data = prisma.notification.create.mock.calls[0][0].data;
      expect(data).not.toHaveProperty('typeId_backup');
      expect(result).toEqual(created);
    });

    it('should create a notification with only notificationType for related-entity types', async () => {
      prisma.story.findUnique.mockResolvedValue({ id: 5 });
      prisma.notification.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 2, ...data }),
      );

      const result = await service.create({
        recipientId: 3,
        senderId: 1,
        type: NotificationTypeEnum.reviewStory,
        relatedEntityId: 5,
      });

      const data = prisma.notification.create.mock.calls[0][0].data;
      expect(data.notificationType).toBe(NotificationTypeEnum.reviewStory);
      expect(data.typeId_backup).toBeUndefined();
      expect(data.relatedEntityId).toBe(5);
      expect(result).toEqual({ id: 2, ...data });
    });
  });
});
