import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ReadingSessionsService } from './reading-sessions.service';
import { ReadingSessionStatus } from './domain/reading-session';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

describe('ReadingSessionsService', () => {
  let service: ReadingSessionsService;
  let readingSessionRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findOverlapping: jest.Mock;
    findManyWithPagination: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    markAttendance: jest.Mock;
  };
  let messageRepository: {
    create: jest.Mock;
    findByReadingSessionId: jest.Mock;
  };
  let usersService: {
    findById: jest.Mock;
    addFeedback: jest.Mock;
    editFeedback: jest.Mock;
  };
  let storiesService: { findDetailedStory: jest.Mock };
  let storyReviewsService: {
    create: jest.Mock;
    updateByUserIdAndStoryId: jest.Mock;
  };
  let webRtcService: { generateToken: jest.Mock };
  let notificationService: {
    pushNoti: jest.Mock;
    getAdminId: jest.Mock;
    softDeleteSessionReminderNotification: jest.Mock;
  };
  let prisma: { readingSession: { findMany: jest.Mock; update: jest.Mock } };
  let configService: { get: jest.Mock };
  let reminderQueue: { add: jest.Mock };

  const makeSession = (overrides: Record<string, unknown> = {}): any =>
    ({
      id: 1,
      humanBookId: 10,
      readerId: 20,
      storyId: 30,
      sessionUrl: '',
      sessionStatus: ReadingSessionStatus.PENDING,
      startedAt: new Date('2024-05-20T01:00:00'),
      endedAt: new Date('2024-05-20T02:00:00'),
      startTime: '08:00',
      endTime: '09:00',
      rating: null,
      preRating: null,
      createdAt: new Date('2024-05-20T01:00:00'),
      updatedAt: new Date('2024-05-20T01:00:00'),
      ...overrides,
    }) as never;

  beforeEach(() => {
    readingSessionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findOverlapping: jest.fn(),
      findManyWithPagination: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      markAttendance: jest.fn(),
    };
    messageRepository = {
      create: jest.fn(),
      findByReadingSessionId: jest.fn(),
    };
    usersService = {
      findById: jest.fn(),
      addFeedback: jest.fn(),
      editFeedback: jest.fn(),
    };
    storiesService = { findDetailedStory: jest.fn() };
    storyReviewsService = {
      create: jest.fn(),
      updateByUserIdAndStoryId: jest.fn(),
    };
    webRtcService = { generateToken: jest.fn() };
    notificationService = {
      pushNoti: jest.fn(),
      getAdminId: jest.fn(),
      softDeleteSessionReminderNotification: jest.fn(),
    };
    prisma = { readingSession: { findMany: jest.fn(), update: jest.fn() } };
    configService = { get: jest.fn() };
    reminderQueue = { add: jest.fn() };
    service = new ReadingSessionsService(
      readingSessionRepository as never,
      messageRepository as never,
      usersService as never,
      storiesService as never,
      storyReviewsService as never,
      webRtcService as never,
      notificationService as never,
      prisma as never,
      configService as never,
      reminderQueue as never,
    );
  });

  describe('createSession', () => {
    const dto = {
      humanBookId: 10,
      readerId: 20,
      storyId: 30,
      startTime: '08:00',
      endTime: '09:00',
      startedAt: '2024-05-20T01:00:00',
      endedAt: '2024-05-20T02:00:00',
    };

    it('should throw NotFound when the huber does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.createSession(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw NotFound when the reader does not exist', async () => {
      usersService.findById
        .mockResolvedValueOnce({ id: 10 })
        .mockResolvedValueOnce(null);

      await expect(service.createSession(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw NotFound when the story does not exist', async () => {
      usersService.findById.mockResolvedValue({ id: 10 });
      usersService.findById.mockResolvedValue({ id: 20 });
      storiesService.findDetailedStory.mockResolvedValue(null);

      await expect(service.createSession(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw when start time is after end time', async () => {
      usersService.findById.mockResolvedValue({ id: 10 });
      storiesService.findDetailedStory.mockResolvedValue({ id: 30 });

      await expect(
        service.createSession({ ...dto, startTime: '10:00', endTime: '09:00' }),
      ).rejects.toThrow('Start time must be before end time');
    });

    it('should throw UnprocessableEntity when the session overlaps another one the same day', async () => {
      usersService.findById.mockResolvedValue({ id: 10 });
      storiesService.findDetailedStory.mockResolvedValue({ id: 30 });
      readingSessionRepository.findOverlapping.mockResolvedValue([
        makeSession({ id: 2, startTime: '07:00', endTime: '08:30' }),
      ]);

      await expect(service.createSession(dto)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('should create a PENDING session, notify and queue a reminder', async () => {
      usersService.findById.mockResolvedValue({ id: 10 });
      storiesService.findDetailedStory.mockResolvedValue({ id: 30 });
      readingSessionRepository.findOverlapping.mockResolvedValue([]);
      readingSessionRepository.create.mockResolvedValue({ id: 1 });

      await service.createSession(dto);

      expect(readingSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          humanBookId: 10,
          readerId: 20,
          storyId: 30,
          sessionStatus: ReadingSessionStatus.PENDING,
        }),
      );
      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.sessionRequest,
          relatedEntityId: 1,
        }),
      );
      expect(reminderQueue.add).toHaveBeenCalledWith(
        'send-booking-email',
        { sessionId: 1 },
        expect.any(Object),
      );
    });
  });

  describe('findAllSessions', () => {
    it('should throw NotFound when the user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.findAllSessions({ limit: 10, offset: 0 }, 5),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should skip pagination when limit or offset is missing', async () => {
      usersService.findById.mockResolvedValue({ id: 5 });
      readingSessionRepository.findManyWithPagination.mockResolvedValue([]);

      await expect(
        service.findAllSessions({ limit: 10, offset: 0 }, 5),
      ).resolves.toEqual([]);
      expect(
        readingSessionRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ paginationOptions: undefined }),
      );
    });

    it('should compute the page from offset and limit', async () => {
      usersService.findById.mockResolvedValue({ id: 5 });
      readingSessionRepository.findManyWithPagination.mockResolvedValue([]);

      await service.findAllSessions({ offset: 20, limit: 10 }, 5);

      expect(
        readingSessionRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ paginationOptions: { page: 3, limit: 10 } }),
      );
    });
  });

  describe('findOneSession', () => {
    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(service.findOneSession(9)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should return the session when found', async () => {
      readingSessionRepository.findById.mockResolvedValue({ id: 1 });

      await expect(service.findOneSession(1)).resolves.toEqual({ id: 1 });
    });
  });

  describe('updateSession', () => {
    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(service.updateSession(9, {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should notify the admin and reader when the session is finished', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.APPROVED,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      notificationService.getAdminId.mockResolvedValue(1);
      readingSessionRepository.update.mockResolvedValue(null);

      await service.updateSession(1, { sessionStatus: 'finished' });

      expect(notificationService.getAdminId).toHaveBeenCalled();
      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.sessionFinish,
          recipientId: 20,
        }),
      );
      expect(
        notificationService.softDeleteSessionReminderNotification,
      ).toHaveBeenCalledWith(1);
    });

    it('should notify the reader when the session is approved', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.PENDING,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      readingSessionRepository.update.mockResolvedValue(null);

      await service.updateSession(1, { sessionStatus: 'approved' });

      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.approveReadingSession,
          recipientId: 20,
        }),
      );
    });

    it('should notify the huber when the session is canceled', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.PENDING,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      readingSessionRepository.update.mockResolvedValue(null);

      await service.updateSession(1, { sessionStatus: 'canceled' });

      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.cancelReadingSession,
          recipientId: 10,
        }),
      );
    });

    it.each([
      ReadingSessionStatus.CANCELED,
      ReadingSessionStatus.MISSED,
      ReadingSessionStatus.FINISHED,
      ReadingSessionStatus.REJECTED,
    ])(
      'should reject approving a session that is already %s',
      async (terminalStatus) => {
        readingSessionRepository.findById.mockResolvedValue(
          makeSession({ sessionStatus: terminalStatus }),
        );

        await expect(
          service.updateSession(1, { sessionStatus: 'approved' }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);

        expect(readingSessionRepository.update).not.toHaveBeenCalled();
      },
    );

    it('should reject a late reject on an auto canceled session', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ sessionStatus: ReadingSessionStatus.CANCELED }),
      );

      await expect(
        service.updateSession(1, { sessionStatus: 'rejected' }),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);

      expect(readingSessionRepository.update).not.toHaveBeenCalled();
    });

    it('should still allow approving a pending session', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ sessionStatus: ReadingSessionStatus.PENDING }),
      );
      readingSessionRepository.update.mockResolvedValue(null);

      await service.updateSession(1, { sessionStatus: 'approved' });

      expect(readingSessionRepository.update).toHaveBeenCalled();
    });
  });

  describe('markAttendance', () => {
    it('should stamp the huber column when the huber joins', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ humanBookId: 10, readerId: 20 }),
      );

      await service.markAttendance(1, 10);

      expect(readingSessionRepository.markAttendance).toHaveBeenCalledWith(
        1,
        'huber',
      );
    });

    it('should stamp the reader column when the reader joins', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ humanBookId: 10, readerId: 20 }),
      );

      await service.markAttendance(1, 20);

      expect(readingSessionRepository.markAttendance).toHaveBeenCalledWith(
        1,
        'reader',
      );
    });

    it('should throw Forbidden when the caller is not a participant', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ humanBookId: 10, readerId: 20 }),
      );

      await expect(service.markAttendance(1, 99)).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(readingSessionRepository.markAttendance).not.toHaveBeenCalled();
    });

    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(service.markAttendance(9, 10)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('checkAndScheduleReminders', () => {
    // The cron runs three scans in a fixed order, so each findMany result has to
    // line up with the scan it feeds.
    const stubScans = (
      upcoming: unknown[],
      stalePending: unknown[],
      overdue: unknown[],
    ) => {
      prisma.readingSession.findMany
        .mockResolvedValueOnce(upcoming)
        .mockResolvedValueOnce(stalePending)
        .mockResolvedValueOnce(overdue);
    };

    const scanWhere = (index: number) =>
      prisma.readingSession.findMany.mock.calls[index][0].where;

    it('should auto cancel an unanswered pending session and notify the reader', async () => {
      stubScans(
        [],
        [
          makeSession({
            sessionStatus: ReadingSessionStatus.PENDING,
            startedAt: new Date('2024-05-01T01:00:00'),
            humanBook: { fullName: 'Tran Thanh Thoa' },
          }),
        ],
        [],
      );
      notificationService.getAdminId.mockResolvedValue(1);

      await service.checkAndScheduleReminders();

      expect(prisma.readingSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          sessionStatus: ReadingSessionStatus.CANCELED,
          rejectReason: expect.stringContaining('did not respond'),
        },
      });
      expect(
        notificationService.softDeleteSessionReminderNotification,
      ).toHaveBeenCalledWith(1);
      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.autoCancelReadingSession,
          recipientId: 20,
          relatedEntityId: 1,
          extraNote: expect.stringContaining('Tran Thanh Thoa'),
        }),
      );
    });

    it('should only look for pending sessions that already started', async () => {
      stubScans([], [], []);

      await service.checkAndScheduleReminders();

      expect(scanWhere(1)).toEqual(
        expect.objectContaining({
          sessionStatus: ReadingSessionStatus.PENDING,
        }),
      );
    });

    it('should skip the auto cancel notification when no admin exists', async () => {
      stubScans(
        [],
        [makeSession({ sessionStatus: ReadingSessionStatus.PENDING })],
        [],
      );
      notificationService.getAdminId.mockResolvedValue(null);

      await service.checkAndScheduleReminders();

      expect(prisma.readingSession.update).toHaveBeenCalled();
      expect(notificationService.pushNoti).not.toHaveBeenCalled();
    });

    it('should mark an approved session as missed and notify both sides when the huber never joined', async () => {
      stubScans(
        [],
        [],
        [
          makeSession({
            sessionStatus: ReadingSessionStatus.APPROVED,
            startedAt: new Date('2024-05-01T01:00:00'),
            huberJoinedAt: null,
          }),
        ],
      );
      notificationService.getAdminId.mockResolvedValue(1);

      await service.checkAndScheduleReminders();

      expect(prisma.readingSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { sessionStatus: ReadingSessionStatus.MISSED },
      });
      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.missReadingSession,
          recipientId: 20,
        }),
      );
      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.huberNoShowReadingSession,
          recipientId: 10,
          extraNote: expect.stringContaining(
            "couldn't confirm your participation",
          ),
        }),
      );
    });

    it('should detect a missed session from attendance, not from ratings', async () => {
      stubScans([], [], []);

      await service.checkAndScheduleReminders();

      expect(scanWhere(2)).toEqual(
        expect.objectContaining({
          sessionStatus: ReadingSessionStatus.APPROVED,
          huberJoinedAt: null,
        }),
      );
      expect(scanWhere(2).OR).toBeUndefined();
    });
  });

  describe('deleteSession', () => {
    it('should soft-delete an existing session', async () => {
      readingSessionRepository.findById.mockResolvedValue({ id: 1 });
      readingSessionRepository.softDelete.mockResolvedValue(null);

      await service.deleteSession(1);

      expect(readingSessionRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(service.deleteSession(9)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateSessionStatus', () => {
    it('should update and persist the new status', async () => {
      const session = makeSession();
      readingSessionRepository.findById.mockResolvedValue(session);
      readingSessionRepository.update.mockResolvedValue(session);

      await service.updateSessionStatus(1, ReadingSessionStatus.APPROVED);

      expect(readingSessionRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          sessionStatus: ReadingSessionStatus.APPROVED,
        }),
      );
    });
  });

  describe('addMessage', () => {
    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.addMessage(9, { content: 'hi', senderId: 20 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should persist the message and return the refreshed session', async () => {
      const session = makeSession();
      readingSessionRepository.findById
        .mockResolvedValueOnce(session)
        .mockResolvedValueOnce(session);
      messageRepository.create.mockResolvedValue(null);

      await service.addMessage(1, { content: 'hi', senderId: 20 });

      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          readingSessionId: 1,
          humanBookId: 10,
          readerId: 20,
          content: 'hi',
        }),
      );
      expect(readingSessionRepository.findById).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSessionMessages', () => {
    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(service.getSessionMessages(9)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should delegate to the message repository', async () => {
      readingSessionRepository.findById.mockResolvedValue({ id: 1 });
      messageRepository.findByReadingSessionId.mockResolvedValue([]);

      await expect(service.getSessionMessages(1)).resolves.toEqual([]);
      expect(messageRepository.findByReadingSessionId).toHaveBeenCalledWith(1);
    });
  });
});
