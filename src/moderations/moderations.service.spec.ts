import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ModerationsService } from './moderations.service';
import { ModerationActionType, ModerationStatus } from './domain/moderation';
import { StatusEnum } from '@statuses/statuses.enum';

describe('ModerationsService', () => {
  let service: ModerationsService;
  let moderationRepository: {
    findReportById: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  let usersService: {
    findById: jest.Mock;
    updateStatus: jest.Mock;
    update: jest.Mock;
  };
  let notificationsService: { getAdminId: jest.Mock; pushNoti: jest.Mock };
  let prisma: {
    report: { update: jest.Mock };
    moderation: { findMany: jest.Mock };
  };
  let mailService: { userBanned: jest.Mock };

  const makeUser = (overrides: Record<string, unknown> = {}) =>
    ({
      id: 3,
      email: 'a@b.com',
      fullName: 'A',
      warnCount: 0,
      status: { id: StatusEnum.active },
      ...overrides,
    }) as never;

  beforeEach(() => {
    moderationRepository = {
      findReportById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    usersService = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
      update: jest.fn(),
    };
    notificationsService = { getAdminId: jest.fn(), pushNoti: jest.fn() };
    prisma = {
      report: { update: jest.fn() },
      moderation: { findMany: jest.fn() },
    };
    mailService = { userBanned: jest.fn() };
    service = new ModerationsService(
      moderationRepository as never,
      usersService as never,
      notificationsService as never,
      prisma as never,
      mailService as never,
    );
  });

  describe('banUser', () => {
    it('should throw NotFound when the user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.banUser({ userId: 3 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw Conflict when the user is already banned', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ status: { id: StatusEnum.inactive } }),
      );

      await expect(service.banUser({ userId: 3 })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should throw NotFound when the report does not exist', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      moderationRepository.findReportById.mockResolvedValue(null);

      await expect(
        service.banUser({ userId: 3, reportId: 9 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequest when the report belongs to another user', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      moderationRepository.findReportById.mockResolvedValue({
        reportedUserId: 99,
      });

      await expect(
        service.banUser({ userId: 3, reportId: 9 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should ban, resolve the report and send an email on success', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      moderationRepository.findReportById.mockResolvedValue({
        reportedUserId: 3,
        markAsResolved: false,
      });
      moderationRepository.find.mockResolvedValue([]);
      moderationRepository.create.mockResolvedValue({ id: 1 });

      await service.banUser({ userId: 3, reportId: 9 });
      expect(usersService.updateStatus).toHaveBeenCalledWith(3, 'inactive');
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: { markAsResolved: true },
      });
      expect(mailService.userBanned).toHaveBeenCalled();
    });

    it('should throw Conflict when an active ban already exists', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      moderationRepository.find.mockResolvedValue([{ id: 1 }]);

      await expect(service.banUser({ userId: 3 })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('unbanUser', () => {
    it('should throw BadRequest when the user is not banned', async () => {
      usersService.findById.mockResolvedValue(makeUser());

      await expect(service.unbanUser({ userId: 3 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should reverse the active ban, reactivate, and record an unban', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ status: { id: StatusEnum.inactive } }),
      );
      moderationRepository.find.mockResolvedValue([{ id: 1 }]);
      moderationRepository.create.mockResolvedValue({ id: 2 });

      await service.unbanUser({ userId: 3 });

      expect(moderationRepository.update).toHaveBeenCalledWith(1, {
        status: ModerationStatus.reversed,
      });
      expect(usersService.update).toHaveBeenCalledWith(3, {
        status: { id: StatusEnum.active },
        warnCount: 0,
      });
      expect(moderationRepository.create).toHaveBeenCalledWith({
        userId: 3,
        actionType: ModerationActionType.unban,
        reportId: undefined,
      });
    });
  });

  describe('warnUser', () => {
    it('should throw Conflict when the user is banned', async () => {
      usersService.findById.mockResolvedValue(
        makeUser({ status: { id: StatusEnum.inactive } }),
      );

      await expect(service.warnUser({ userId: 3 })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should increment the warn count and push a notification', async () => {
      usersService.findById.mockResolvedValue(makeUser({ warnCount: 1 }));
      moderationRepository.create.mockResolvedValue({ id: 5 });
      notificationsService.getAdminId.mockResolvedValue(2);

      const result = await service.warnUser({ userId: 3 });

      expect(usersService.update).toHaveBeenCalledWith(3, { warnCount: 2 });
      expect(notificationsService.pushNoti).toHaveBeenCalledWith({
        senderId: 2,
        recipientId: 3,
        type: expect.any(String),
        relatedEntityId: 5,
      });
      expect(result).toEqual({ id: 5 });
    });

    it('should throw BadRequest when the report is already resolved', async () => {
      usersService.findById.mockResolvedValue(makeUser());
      moderationRepository.findReportById.mockResolvedValue({
        reportedUserId: 3,
        markAsResolved: true,
      });

      await expect(
        service.warnUser({ userId: 3, reportId: 9 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('unwarnUser', () => {
    it('should throw BadRequest when there are no warnings', async () => {
      usersService.findById.mockResolvedValue(makeUser({ warnCount: 0 }));

      await expect(service.unwarnUser({ userId: 3 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should reverse the latest warning and decrement the count', async () => {
      usersService.findById.mockResolvedValue(makeUser({ warnCount: 2 }));
      moderationRepository.find.mockResolvedValue([{ id: 4 }]);
      moderationRepository.create.mockResolvedValue({ id: 6 });

      await service.unwarnUser({ userId: 3 });

      expect(moderationRepository.update).toHaveBeenCalledWith(4, {
        status: ModerationStatus.reversed,
      });
      expect(usersService.update).toHaveBeenCalledWith(3, { warnCount: 1 });
    });
  });

  describe('findModerations', () => {
    it('should query with default pagination when no query is given', async () => {
      prisma.moderation.findMany.mockResolvedValue([]);

      await expect(service.findModerations({ userId: 3 })).resolves.toEqual([]);
      expect(prisma.moderation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should pass the query filters through to the prisma query', async () => {
      prisma.moderation.findMany.mockResolvedValue([]);

      await service.findModerations({
        userId: 3,
        actionType: ModerationActionType.ban,
        page: 2,
        limit: 5,
      });

      expect(prisma.moderation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 3,
            actionType: ModerationActionType.ban,
          }),
          skip: 5,
          take: 5,
        }),
      );
    });
  });
});
