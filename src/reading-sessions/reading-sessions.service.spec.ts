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
    findUpcoming: jest.Mock;
    countByFilterOption: jest.Mock;
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
  let prisma: {
    readingSession: {
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    feedback: {
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };
  let configService: { get: jest.Mock };
  let reminderQueue: { add: jest.Mock };
  let socketService: { emitToUser: jest.Mock };

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
      findUpcoming: jest.fn(),
      countByFilterOption: jest.fn(),
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
    prisma = {
      readingSession: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      feedback: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    configService = { get: jest.fn() };
    reminderQueue = { add: jest.fn() };
    socketService = { emitToUser: jest.fn() };
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
      socketService as never,
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
      readingSessionRepository.create.mockResolvedValue({
        id: 1,
        endedAt: new Date(dto.endedAt),
      });

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
      expect(reminderQueue.add).toHaveBeenCalledWith(
        'send-meeting-request-sent-email',
        { sessionId: 1 },
        expect.any(Object),
      );
      // System end scheduled at endedAt (delay clamped at 0 here — dto times
      // are in the past).
      expect(reminderQueue.add).toHaveBeenCalledWith(
        'auto-end-session',
        { sessionId: 1 },
        expect.objectContaining({ delay: expect.any(Number) }),
      );
    });
  });

  describe('findAllSessions', () => {
    const emptyPage = { data: [], count: 0 };
    const emptyCounts = {
      all: 0,
      approved: 0,
      pending: 0,
      finished: 0,
      missed: 0,
    };

    beforeEach(() => {
      usersService.findById.mockResolvedValue({ id: 5 });
      readingSessionRepository.findManyWithPagination.mockResolvedValue(
        emptyPage,
      );
      readingSessionRepository.countByFilterOption.mockResolvedValue(
        emptyCounts,
      );
    });

    const paginationOf = () =>
      readingSessionRepository.findManyWithPagination.mock.calls[0][0]
        .paginationOptions;

    it('should throw NotFound when the user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.findAllSessions({ limit: 10, offset: 0 }, 5),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should default to the first page of 12 when no params are sent', async () => {
      await service.findAllSessions({}, 5);

      expect(paginationOf()).toEqual({ page: 1, limit: 12 });
    });

    it('should paginate the first page when offset is 0', async () => {
      await service.findAllSessions({ limit: 12, offset: 0 }, 5);

      expect(paginationOf()).toEqual({ page: 1, limit: 12 });
    });

    it('should compute the page from offset and limit', async () => {
      await service.findAllSessions({ offset: 20, limit: 10 }, 5);

      expect(paginationOf()).toEqual({ page: 3, limit: 10 });
    });

    it('should accept page directly', async () => {
      await service.findAllSessions({ page: 4, limit: 10 }, 5);

      expect(paginationOf()).toEqual({ page: 4, limit: 10 });
    });

    it('should let offset win when both page and offset are sent', async () => {
      await service.findAllSessions({ page: 9, offset: 20, limit: 10 }, 5);

      expect(paginationOf()).toEqual({ page: 3, limit: 10 });
    });

    it('should honor a limit above the default', async () => {
      await service.findAllSessions({ limit: 50 }, 5);

      expect(paginationOf()).toEqual({ page: 1, limit: 50 });
    });

    it('should return the data and total in a paginated envelope', async () => {
      readingSessionRepository.findManyWithPagination.mockResolvedValue({
        data: [makeSession({ id: 7 })],
        count: 25,
      });

      const result = await service.findAllSessions({ limit: 12 }, 5);

      expect(result.data).toHaveLength(1);
      expect(result.meta).toMatchObject({
        totalItems: 25,
        itemsPerPage: 12,
        totalPages: 3,
        currentPage: 1,
      });
    });

    it('should include the per-filter counts in meta', async () => {
      readingSessionRepository.countByFilterOption.mockResolvedValue({
        all: 25,
        approved: 9,
        pending: 6,
        finished: 13,
        missed: 1,
      });

      const result = await service.findAllSessions({}, 5);

      expect(result.meta.counts).toEqual({
        all: 25,
        approved: 9,
        pending: 6,
        finished: 13,
        missed: 1,
      });
    });

    it('should scope both the page and the counts to the caller', async () => {
      await service.findAllSessions({}, 5);

      expect(
        readingSessionRepository.findManyWithPagination,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          filterOptions: expect.objectContaining({ userId: 5 }),
        }),
      );
      expect(readingSessionRepository.countByFilterOption).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 5 }),
      );
    });
  });

  describe('findUpcomingSessions', () => {
    const humanBook = {
      id: 10,
      fullName: 'Huber',
      photo: { id: 'file-1', path: 'avatars/huber.png' },
      role: { id: 2, name: 'humanBook' },
    };
    const reader = {
      id: 20,
      fullName: 'Reader',
      photo: { id: 'file-2', path: 'avatars/reader.png' },
      role: { id: 3, name: 'reader' },
    };

    beforeEach(() => {
      readingSessionRepository.findUpcoming.mockResolvedValue([]);
    });

    it('should default withinHours to 24 and limit to 5', async () => {
      await service.findUpcomingSessions({}, 10);

      expect(readingSessionRepository.findUpcoming).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 10, withinHours: 24, limit: 5 }),
      );
    });

    it('should forward the requested withinHours and limit', async () => {
      await service.findUpcomingSessions({ withinHours: 6, limit: 2 }, 10);

      expect(readingSessionRepository.findUpcoming).toHaveBeenCalledWith(
        expect.objectContaining({ withinHours: 6, limit: 2 }),
      );
    });

    it('should resolve the reader as counterpart when the caller is the human book', async () => {
      readingSessionRepository.findUpcoming.mockResolvedValue([
        makeSession({
          id: 7,
          humanBookId: 10,
          readerId: 20,
          humanBook,
          reader,
        }),
      ]);

      const result = await service.findUpcomingSessions({}, 10);

      expect(result.data[0].counterpart).toEqual({
        id: 20,
        fullName: 'Reader',
        photo: reader.photo,
        role: reader.role,
      });
    });

    it('should resolve the human book as counterpart when the caller is the reader', async () => {
      readingSessionRepository.findUpcoming.mockResolvedValue([
        makeSession({
          id: 7,
          humanBookId: 10,
          readerId: 20,
          humanBook,
          reader,
        }),
      ]);

      const result = await service.findUpcomingSessions({}, 20);

      expect(result.data[0].counterpart).toEqual({
        id: 10,
        fullName: 'Huber',
        photo: humanBook.photo,
        role: humanBook.role,
      });
    });

    it('should return only the minimal session fields', async () => {
      readingSessionRepository.findUpcoming.mockResolvedValue([
        makeSession({
          id: 7,
          humanBookId: 10,
          readerId: 20,
          humanBook,
          reader,
        }),
      ]);

      const result = await service.findUpcomingSessions({}, 10);

      expect(Object.keys(result.data[0]).sort()).toEqual([
        'counterpart',
        'endedAt',
        'id',
        'sessionStatus',
        'startedAt',
      ]);
    });

    it('should return count and a UTC server time in meta', async () => {
      readingSessionRepository.findUpcoming.mockResolvedValue([
        makeSession({
          id: 7,
          humanBookId: 10,
          readerId: 20,
          humanBook,
          reader,
        }),
        makeSession({
          id: 8,
          humanBookId: 10,
          readerId: 20,
          humanBook,
          reader,
        }),
      ]);

      const result = await service.findUpcomingSessions({}, 10);

      expect(result.meta.count).toBe(2);
      expect(new Date(result.meta.serverTime).toISOString()).toBe(
        result.meta.serverTime,
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

    it('should queue a declined-email after the huber rejects a session', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.PENDING,
      });
      readingSessionRepository.findById.mockResolvedValue(session);

      await service.updateSession(1, {
        sessionStatus: ReadingSessionStatus.REJECTED,
        rejectReason: 'Not available',
      });

      expect(reminderQueue.add).toHaveBeenCalledWith(
        'send-meeting-declined-email',
        { sessionId: 1 },
        expect.any(Object),
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
      expect(reminderQueue.add).toHaveBeenCalledWith(
        'send-meeting-canceled-email',
        { sessionId: 1 },
        expect.any(Object),
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

  describe('endSession', () => {
    it('should forbid a non-participant', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.APPROVED,
        }),
      );

      await expect(service.endSession(1, 99)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(readingSessionRepository.update).not.toHaveBeenCalled();
      expect(socketService.emitToUser).not.toHaveBeenCalled();
    });

    it('should finish once, notify, and emit call-ended to the peer', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.APPROVED,
        }),
      );
      notificationService.getAdminId.mockResolvedValue(1);
      prisma.readingSession.updateMany.mockResolvedValue({ count: 1 });

      await service.endSession(1, 10);

      expect(prisma.readingSession.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          sessionStatus: { not: ReadingSessionStatus.FINISHED },
        },
        data: { sessionStatus: ReadingSessionStatus.FINISHED },
      });
      expect(notificationService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.sessionFinish,
          recipientId: 20,
        }),
      );
      expect(
        notificationService.softDeleteSessionReminderNotification,
      ).toHaveBeenCalledWith(1);
      expect(socketService.emitToUser).toHaveBeenCalledWith(20, 'call-ended');
    });

    it('should no-op when the session is already finished', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.FINISHED,
        }),
      );

      await service.endSession(1, 20);

      expect(readingSessionRepository.update).not.toHaveBeenCalled();
      expect(notificationService.pushNoti).not.toHaveBeenCalled();
      expect(socketService.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('autoEndSession', () => {
    it('should skip when the session is not approved', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ sessionStatus: ReadingSessionStatus.PENDING }),
      );

      await expect(service.autoEndSession(1)).resolves.toBe(false);
      expect(prisma.readingSession.updateMany).not.toHaveBeenCalled();
    });

    it('should skip before endedAt', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.APPROVED,
          endedAt: new Date(Date.now() + 60_000),
          huberJoinedAt: new Date(),
        }),
      );

      await expect(service.autoEndSession(1)).resolves.toBe(false);
      expect(prisma.readingSession.updateMany).not.toHaveBeenCalled();
    });

    it('should skip when nobody joined (leave for the missed-session cron)', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.APPROVED,
          endedAt: new Date(Date.now() - 1000),
        }),
      );

      await expect(service.autoEndSession(1)).resolves.toBe(false);
      expect(prisma.readingSession.updateMany).not.toHaveBeenCalled();
    });

    it('should finish and emit call-ended to BOTH participants', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.APPROVED,
          endedAt: new Date(Date.now() - 1000),
          huberJoinedAt: new Date(),
          readerJoinedAt: new Date(),
        }),
      );
      notificationService.getAdminId.mockResolvedValue(1);
      prisma.readingSession.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.autoEndSession(1)).resolves.toBe(true);

      expect(prisma.readingSession.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          sessionStatus: { not: ReadingSessionStatus.FINISHED },
        },
        data: { sessionStatus: ReadingSessionStatus.FINISHED },
      });
      expect(socketService.emitToUser).toHaveBeenCalledWith(20, 'call-ended');
      expect(socketService.emitToUser).toHaveBeenCalledWith(10, 'call-ended');
    });

    it('should no-op when the session was already finished by another trigger', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          sessionStatus: ReadingSessionStatus.APPROVED,
          endedAt: new Date(Date.now() - 1000),
          huberJoinedAt: new Date(),
        }),
      );
      prisma.readingSession.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.autoEndSession(1)).resolves.toBe(true);

      expect(notificationService.pushNoti).not.toHaveBeenCalled();
      expect(socketService.emitToUser).not.toHaveBeenCalled();
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

    it('should reject a stamp more than 30 minutes before the start time', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          humanBookId: 10,
          readerId: 20,
          startedAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        }),
      );

      await expect(service.markAttendance(1, 10)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );

      expect(readingSessionRepository.markAttendance).not.toHaveBeenCalled();
    });

    it('should accept a stamp inside the 30 minute grace window', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          humanBookId: 10,
          readerId: 20,
          startedAt: new Date(Date.now() + 20 * 60 * 1000),
        }),
      );

      await service.markAttendance(1, 10);

      expect(readingSessionRepository.markAttendance).toHaveBeenCalledWith(
        1,
        'huber',
      );
    });

    it('should reject the non participant before checking the start time', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({
          humanBookId: 10,
          readerId: 20,
          startedAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        }),
      );

      await expect(service.markAttendance(1, 99)).rejects.toBeInstanceOf(
        ForbiddenException,
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

    it('should only look for pending sessions waiting longer than 24 hours', async () => {
      stubScans([], [], []);

      await service.checkAndScheduleReminders();

      expect(scanWhere(1)).toEqual(
        expect.objectContaining({
          createdAt: { lte: expect.any(Date) },
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

  describe('submitFeedback', () => {
    const dto = {
      feelingRating: 4,
      satisfactionRating: 5,
      sessionContent: 'Very helpful',
      huber: { rating: 5, content: 'Great listener', skipped: false },
    };

    it('should throw NotFound when no session exists', async () => {
      readingSessionRepository.findById.mockResolvedValue(null);

      await expect(service.submitFeedback(9, 20, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw Forbidden when the caller is not the reader', async () => {
      readingSessionRepository.findById.mockResolvedValue(
        makeSession({ sessionStatus: ReadingSessionStatus.FINISHED }),
      );

      await expect(service.submitFeedback(1, 10, dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(readingSessionRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntity when the session is not finished', async () => {
      readingSessionRepository.findById.mockResolvedValue(makeSession());

      await expect(service.submitFeedback(1, 20, dto)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('should return the stored state without writing when already submitted', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.FINISHED,
        feedbackSubmittedAt: new Date('2026-11-01T00:00:00Z'),
      });
      readingSessionRepository.findById.mockResolvedValue(session);

      await expect(service.submitFeedback(1, 20, dto)).resolves.toBe(session);
      expect(readingSessionRepository.update).not.toHaveBeenCalled();
      expect(prisma.feedback.create).not.toHaveBeenCalled();
    });

    it('should persist feedback and create the reader-to-huber row', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.FINISHED,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      prisma.feedback.findFirst.mockResolvedValueOnce(null);
      prisma.feedback.findFirst.mockResolvedValueOnce(null);
      readingSessionRepository.update.mockResolvedValue(session);

      await service.submitFeedback(1, 20, dto);

      expect(readingSessionRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          feelingRating: 4,
          satisfactionRating: 5,
          sessionContent: 'Very helpful',
          huberRating: 5,
          huberContent: 'Great listener',
          huberFeedbackSkipped: false,
          feedbackSubmittedAt: expect.any(Date),
        }),
      );
      expect(prisma.feedback.create).toHaveBeenCalledWith({
        data: {
          readingSessionId: 1,
          feedbackById: 20,
          feedbackToId: 10,
          rating: 5,
          content: 'Great listener',
        },
      });
    });

    it('should update an existing session-linked feedback row', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.FINISHED,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      prisma.feedback.findFirst.mockResolvedValueOnce({ id: 99 });
      readingSessionRepository.update.mockResolvedValue(session);

      await service.submitFeedback(1, 20, dto);

      expect(prisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 99 },
        data: { rating: 5, content: 'Great listener' },
      });
      expect(prisma.feedback.create).not.toHaveBeenCalled();
    });

    it('should adopt a legacy pair feedback row for the session', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.FINISHED,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      prisma.feedback.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 88 });
      readingSessionRepository.update.mockResolvedValue(session);

      await service.submitFeedback(1, 20, dto);

      expect(prisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 88 },
        data: {
          rating: 5,
          content: 'Great listener',
          readingSessionId: 1,
        },
      });
    });

    it('should store a skip without touching the feedback row', async () => {
      const session = makeSession({
        sessionStatus: ReadingSessionStatus.FINISHED,
      });
      readingSessionRepository.findById.mockResolvedValue(session);
      readingSessionRepository.update.mockResolvedValue(session);

      await service.submitFeedback(1, 20, {
        feelingRating: 3,
        satisfactionRating: 3,
        huber: { skipped: true },
      });

      expect(prisma.feedback.findFirst).not.toHaveBeenCalled();
      expect(prisma.feedback.create).not.toHaveBeenCalled();
      expect(readingSessionRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          huberRating: null,
          huberContent: null,
          huberFeedbackSkipped: true,
          feedbackSubmittedAt: expect.any(Date),
        }),
      );
    });
  });
});
