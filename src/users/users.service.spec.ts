import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { FilesService } from '@files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '@prisma-client/prisma-client.service';
import bcrypt from 'bcryptjs';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Approval, Action } from './approval.enum';
import { AuthProvidersEnum } from '@auth/auth-providers.enum';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { GenderEnum } from '@genders/genders.enum';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';
import { PublishStatus } from '@stories/status.enum';
import { ReadingSessionStatus } from '@reading-sessions/domain';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: {
    create: jest.Mock;
    findManyWithPagination: jest.Mock;
    findByEmail: jest.Mock;
    findBySocialIdAndProvider: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let filesService: { findById: jest.Mock };
  let notificationsService: { getAdminId: jest.Mock; pushNoti: jest.Mock };
  let prisma: Record<string, any>;

  beforeEach(() => {
    usersRepository = {
      create: jest.fn(),
      findManyWithPagination: jest.fn(),
      findByEmail: jest.fn(),
      findBySocialIdAndProvider: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    filesService = { findById: jest.fn() };
    notificationsService = { getAdminId: jest.fn(), pushNoti: jest.fn() };
    prisma = {};

    service = new UsersService(
      usersRepository as unknown as UserRepository,
      filesService as unknown as FilesService,
      notificationsService as unknown as NotificationsService,
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should default approval and provider, and hash the password', async () => {
      const genSalt = jest
        .spyOn(bcrypt, 'genSalt')
        .mockResolvedValue('salt' as never);
      const hash = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed' as never);
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({ id: 1 });

      const result = await service.create({
        email: 'john@example.com',
        password: 'secret12',
        fullName: 'John',
      });

      expect(genSalt).toHaveBeenCalled();
      expect(hash).toHaveBeenCalledWith('secret12', 'salt');
      expect(usersRepository.create).toHaveBeenCalledWith({
        approval: Approval.notRequested,
        provider: AuthProvidersEnum.email,
        email: 'john@example.com',
        password: 'hashed',
        fullName: 'John',
      });
      expect(result).toEqual({ id: 1 });
    });

    it('should not hash when no password is provided', async () => {
      const hash = jest.spyOn(bcrypt, 'hash');
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({ id: 1 });

      await service.create({ email: 'a@b.com', fullName: 'A' } as any);

      expect(hash).not.toHaveBeenCalled();
    });

    it('should throw when the email is already taken', async () => {
      usersRepository.findByEmail.mockResolvedValue({ id: 5 });

      await expect(
        service.create({ email: 'a@b.com', fullName: 'A' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw when the photo file does not exist', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      filesService.findById.mockResolvedValue(null);

      await expect(
        service.create({
          email: 'a@b.com',
          fullName: 'A',
          photo: { id: 'file-1' },
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the role id is unknown', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({ id: 1 });

      await expect(
        service.create({
          email: 'a@b.com',
          fullName: 'A',
          role: { id: 99 },
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw when the gender id is unknown', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.create({
          email: 'a@b.com',
          fullName: 'A',
          gender: { id: 99 },
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when the status id is unknown', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.create({
          email: 'a@b.com',
          fullName: 'A',
          status: { id: 99 },
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should accept valid gender, role and status ids', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({ id: 1 });

      await service.create({
        email: 'a@b.com',
        fullName: 'A',
        gender: { id: GenderEnum.male },
        role: { id: RoleEnum.reader },
        status: { id: StatusEnum.active },
      } as any);

      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: { id: GenderEnum.male },
          role: { id: RoleEnum.reader },
          status: { id: StatusEnum.active },
        }),
      );
    });
  });

  describe('findManyWithPagination', () => {
    it('should delegate to the repository', async () => {
      const payload = {
        filterOptions: { role: 'reader' },
        sortOptions: [{ orderBy: 'fullName', order: 'asc' }],
        paginationOptions: { page: 2, limit: 10 },
      };
      usersRepository.findManyWithPagination.mockResolvedValue({
        data: [],
        count: 0,
      });

      await expect(
        service.findManyWithPagination(payload as any),
      ).resolves.toEqual({ data: [], count: 0 });
      expect(usersRepository.findManyWithPagination).toHaveBeenCalledWith(
        payload,
      );
    });
  });

  describe('findById', () => {
    function makePrismaUser(overrides: Record<string, any> = {}) {
      return {
        id: 7,
        email: 'huber@example.com',
        fullName: 'Huber',
        bio: null,
        videoUrl: null,
        humanBookTopic: [],
        topicsOfInterest: [],
        educations: [],
        works: [],
        file: null,
        coverImage: null,
        role: { id: RoleEnum.humanBook },
        status: { id: StatusEnum.active },
        _count: {
          storyFavorite: 0,
          feedbackTos: 0,
          timeSlots: 0,
          favoritedByUsers: 0,
          huberReadingSessions: 0,
          topicsOfInterest: 0,
        },
        ...overrides,
      };
    }

    it('should throw NotFoundException when the user does not exist', async () => {
      prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };

      await expect(service.findById(7)).rejects.toThrow(NotFoundException);
    });

    it('should assemble the huber profile with ratings and counts', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue(
          makePrismaUser({
            humanBookTopic: [
              { topic: { id: 1, name: 'Gia đình', color: 'pink' } },
              { topic: { id: 2, name: 'Nhà cửa', color: 'green' } },
            ],
            _count: {
              storyFavorite: 4,
              feedbackTos: 6,
              timeSlots: 2,
              favoritedByUsers: 9,
              huberReadingSessions: 3,
              topicsOfInterest: 1,
            },
          }),
        ),
      };
      prisma.$queryRaw = jest
        .fn()
        .mockResolvedValue([
          { huberSince: new Date('2024-02-01'), hasSeenHuberOnboarding: true },
        ]);
      prisma.story = {
        count: jest.fn().mockResolvedValue(5),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      };
      prisma.feedback = {
        aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 4.26 } }),
      };

      const result = await service.findById(7);

      expect(result).toEqual(
        expect.objectContaining({
          id: 7,
          sharingTopics: [
            { id: 1, name: 'Gia đình', color: 'pink' },
            { id: 2, name: 'Nhà cửa', color: 'green' },
          ],
          huberSince: new Date('2024-02-01'),
          hasSeenHuberOnboarding: true,
          storiesCount: 5,
          conversationsCount: 3,
          followersCount: 9,
          rating: 4.3,
          ratingCount: 6,
          profileState: expect.objectContaining({
            roleLabel: 'Huber',
            canCreateBook: false,
            menuItems: [
              'introduction',
              'schedule',
              'myBooks',
              'favoriteBooks',
              'reviewsAboutMe',
            ],
            huberStar: expect.objectContaining({ isUnlocked: true }),
          }),
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should fall back to defaults when the huber metadata is missing', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue(makePrismaUser({ id: 9 })),
      };
      prisma.$queryRaw = jest.fn().mockResolvedValue([]);
      prisma.story = {
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
      };
      prisma.feedback = {
        aggregate: jest.fn().mockResolvedValue({ _avg: { rating: null } }),
      };

      const result = await service.findById(9);

      expect(result).toEqual(
        expect.objectContaining({
          huberSince: null,
          hasSeenHuberOnboarding: false,
          profileState: expect.objectContaining({
            roleLabel: 'Huber',
            canCreateBook: false,
            shouldShowHuberOnboarding: true,
            huberStar: expect.objectContaining({ isUnlocked: false }),
          }),
        }),
      );
    });

    it('should return shared topics for a huber and the first story for a reader', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue(
          makePrismaUser({
            id: 11,
            humanBookTopic: [
              { topic: { id: 1, name: 'Gia đình', color: 'pink' } },
            ],
            topicsOfInterest: [
              { topic: { id: 3, name: 'Sách', color: 'blue' } },
            ],
            role: { id: RoleEnum.reader },
          }),
        ),
      };
      prisma.$queryRaw = jest.fn().mockResolvedValue([]);
      prisma.story = {
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 33, title: 'First Story', cover: null }),
        updateMany: jest.fn(),
      };
      prisma.feedback = { aggregate: jest.fn() };

      const result = await service.findById(11);

      expect(result).toEqual(
        expect.objectContaining({
          sharingTopics: [{ id: 1, name: 'Gia đình', color: 'pink' }],
          topicsOfInterest: [{ id: 3, name: 'Sách', color: 'blue' }],
          firstStory: { id: 33, title: 'First Story', cover: null },
          profileState: expect.objectContaining({ roleLabel: 'Liber' }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should hash the new password when it differs from the previous one', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      const hash = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed' as never);
      usersRepository.update.mockResolvedValue({ id: 1 });

      await service.update(1, {
        password: 'new-password',
        previousPassword: 'old-password',
      } as any);

      expect(hash).toHaveBeenCalledWith('new-password', 'salt');
      expect(usersRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ password: 'hashed' }),
      );
    });

    it('should not hash when password equals previousPassword', async () => {
      const hash = jest.spyOn(bcrypt, 'hash');
      usersRepository.update.mockResolvedValue({ id: 1 });

      await service.update(1, {
        password: 'same',
        previousPassword: 'same',
      } as any);

      expect(hash).not.toHaveBeenCalled();
    });

    it('should throw when the email belongs to another user', async () => {
      usersRepository.findByEmail.mockResolvedValue({ id: 2 });

      await expect(
        service.update(1, { email: 'a@b.com' } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should allow keeping the same email', async () => {
      usersRepository.findByEmail.mockResolvedValue({ id: 1 });
      usersRepository.update.mockResolvedValue({ id: 1 });

      await service.update(1, { email: 'a@b.com' } as any);

      expect(usersRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ email: 'a@b.com' }),
      );
    });

    it('should throw when a new photo file does not exist', async () => {
      filesService.findById.mockResolvedValue(null);

      await expect(
        service.update(1, { photo: { id: 'file-9' } } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw when a new cover image does not exist', async () => {
      filesService.findById.mockResolvedValue(null);

      await expect(
        service.update(1, { coverImage: { id: 'file-9' } } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should reject unknown role, status and gender ids', async () => {
      await expect(
        service.update(1, { role: { id: 99 } } as any),
      ).rejects.toThrow(UnprocessableEntityException);
      await expect(
        service.update(1, { status: { id: 99 } } as any),
      ).rejects.toThrow(UnprocessableEntityException);
      await expect(
        service.update(1, { gender: { id: 99 } } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should delegate a valid update to the repository', async () => {
      usersRepository.update.mockResolvedValue({ id: 1 });

      const payload = { fullName: 'New Name' };
      await service.update(1, payload as any);

      expect(usersRepository.update).toHaveBeenCalledWith(1, payload);
    });
  });

  describe('updateLanguage', () => {
    it('should throw when the user does not exist', async () => {
      prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };

      await expect(service.updateLanguage(1, 'vi')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the language code', async () => {
      prisma.user = {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1, languageCode: 'vi' }),
      };

      const result = await service.updateLanguage(1, 'vi');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { languageCode: 'vi' },
        select: { id: true, languageCode: true },
      });
      expect(result).toEqual({ id: 1, languageCode: 'vi' });
    });
  });

  describe('updateStatus', () => {
    function makePrisma() {
      return {
        user: {
          findUnique: jest.fn().mockResolvedValue({ id: 1 }),
          update: jest.fn().mockResolvedValue({ id: 1 }),
        },
        story: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        $transaction: jest.fn(),
      };
    }

    it('should throw when the status value is unknown', async () => {
      prisma.user = { findUnique: jest.fn() };

      await expect(service.updateStatus(1, 'bogus')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw when the user does not exist', async () => {
      prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };

      await expect(service.updateStatus(1, 'active')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should soft-delete the user stories on inactivation', async () => {
      const prismaMock = makePrisma();
      prismaMock.$transaction.mockResolvedValue([{ id: 1 }]);
      Object.assign(prisma, prismaMock);

      const result = await service.updateStatus(1, 'inactive');

      expect(prismaMock.$transaction).toHaveBeenCalledWith([
        expect.anything(),
        expect.anything(),
      ]);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { statusId: StatusEnum.inactive },
        }),
      );
      expect(prismaMock.story.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { humanBookId: 1 },
          data: { publishStatus: PublishStatus.deleted },
        }),
      );
      expect(result).toEqual({ id: 1 });
    });

    it('should just update the status for a non-inactive value', async () => {
      const prismaMock = makePrisma();
      Object.assign(prisma, prismaMock);

      await service.updateStatus(1, 'active');

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { statusId: StatusEnum.active },
        }),
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delegate to the repository', async () => {
      usersRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(usersRepository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('updatePassword', () => {
    it('should delegate to the repository', async () => {
      usersRepository.update.mockResolvedValue({ id: 1 });

      await service.updatePassword('1', 'new-password');

      expect(usersRepository.update).toHaveBeenCalledWith('1', {
        password: 'new-password',
      });
    });
  });

  describe('upgrade', () => {
    it('should throw BadRequestException for an unknown action', async () => {
      await expect(service.upgrade(1, { action: 'maybe' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept a reader as huber and notify them', async () => {
      notificationsService.getAdminId.mockResolvedValue(99);
      usersRepository.update.mockResolvedValue({ id: 1 });
      prisma.story = { updateMany: jest.fn().mockResolvedValue({ count: 1 }) };

      const result = await service.upgrade(1, { action: Action.accept });

      expect(usersRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          role: { id: RoleEnum.humanBook },
          approval: Approval.approved,
          huberSince: expect.any(Date),
        }),
      );
      expect(notificationsService.pushNoti).toHaveBeenCalledWith({
        senderId: 99,
        recipientId: 1,
        type: NotificationTypeEnum.account,
      });
      expect(prisma.story.updateMany).toHaveBeenCalledWith({
        where: { humanBookId: 1 },
        data: { publishStatus: PublishStatus.published },
      });
      expect(result.message).toContain('Approve');
    });

    it('should not notify or publish when no admin exists', async () => {
      notificationsService.getAdminId.mockResolvedValue(null);
      usersRepository.update.mockResolvedValue({ id: 1 });
      prisma.story = { updateMany: jest.fn().mockResolvedValue({ count: 1 }) };

      await service.upgrade(1, { action: Action.accept });

      expect(notificationsService.pushNoti).not.toHaveBeenCalled();
      expect(prisma.story.updateMany).toHaveBeenCalled();
    });

    it('should reject a huber upgrade request with the reason attached', async () => {
      notificationsService.getAdminId.mockResolvedValue(99);
      usersRepository.update.mockResolvedValue({ id: 1 });

      const result = await service.upgrade(1, {
        action: Action.reject,
        reason: 'Invalid info',
      });

      expect(usersRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ approval: Approval.rejected }),
      );
      expect(notificationsService.pushNoti).toHaveBeenCalledWith({
        senderId: 99,
        recipientId: 1,
        type: NotificationTypeEnum.rejectHuber,
        extraNote: 'Invalid info',
      });
      expect(result.message).toContain('Reject');
    });
  });

  describe('addFeedback / getFeedback / editFeedback', () => {
    it('should add a feedback entry', async () => {
      prisma.user = {
        update: jest.fn().mockResolvedValue({ id: 1 }),
      };

      await service.addFeedback(1, 2, { rating: 5, content: 'Great' } as any);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          feedbackBys: {
            create: {
              rating: 5,
              content: 'Great',
              feedbackTo: { connect: { id: 2 } },
            },
          },
        },
      });
    });

    it('should fetch feedback scoped to both sides', async () => {
      prisma.user = { findFirst: jest.fn().mockResolvedValue({ id: 1 }) };

      const result = await service.getFeedback(1, 2);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        include: {
          feedbackBys: { where: { feedbackById: 1 } },
          feedbackTos: { where: { feedbackToId: 2 } },
        },
      });
      expect(result).toEqual({ id: 1 });
    });

    it('should edit the matching feedback record', async () => {
      prisma.user = {
        findFirst: jest.fn().mockResolvedValue({ id: 12 }),
      };
      prisma.feedback = { update: jest.fn().mockResolvedValue({ id: 12 }) };

      await service.editFeedback(1, 2, { rating: 4, content: 'OK' });

      expect(prisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 12 },
        data: { rating: 4, content: 'OK' },
      });
    });
  });

  describe('markHuberOnboardingSeen', () => {
    it('should update the flag and return the marker', async () => {
      prisma.$executeRaw = jest.fn().mockResolvedValue(undefined);

      const result = await service.markHuberOnboardingSeen(6);

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(result).toEqual({ id: 6, hasSeenHuberOnboarding: true });
    });
  });

  describe('getReadingSessions', () => {
    it('should paginate sessions matching the user and status', async () => {
      prisma.readingSession = {
        count: jest.fn().mockResolvedValue(25),
        findMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      };
      prisma.$transaction = jest
        .fn()
        .mockResolvedValue([25, [{ id: 1 }, { id: 2 }]]);

      const result = await service.getReadingSessions({
        userId: 3,
        status: ReadingSessionStatus.FINISHED,
        paginationOptions: { page: 2, limit: 10 },
      });

      expect(prisma.readingSession.count).toHaveBeenCalledWith({
        where: {
          AND: [
            { OR: [{ humanBookId: 3 }, { readerId: 3 }] },
            { sessionStatus: ReadingSessionStatus.FINISHED },
          ],
        },
      });
      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          totalItems: 25,
          itemsPerPage: 10,
          totalPages: 3,
          currentPage: 2,
        },
      });
    });
  });

  describe('educations', () => {
    it('should throw when the user does not exist', async () => {
      prisma.user = { findUnique: jest.fn().mockResolvedValue(null) };

      await expect(
        service.addEducation(1, {
          major: 'CS',
          institution: 'UIT',
          startedAt: '2020-01-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only allow human books to add education', async () => {
      prisma.user = {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 1, roleId: RoleEnum.reader }),
      };

      await expect(
        service.addEducation(1, {
          major: 'CS',
          institution: 'UIT',
          startedAt: '2020-01-01',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create the education with parsed dates and isPublic default', async () => {
      prisma.user = {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 1, roleId: RoleEnum.humanBook }),
      };
      prisma.education = { create: jest.fn().mockResolvedValue({ id: 8 }) };

      const result = await service.addEducation(1, {
        major: 'CS',
        institution: 'UIT',
        startedAt: '2020-01-01',
        endedAt: '2024-01-01',
      });

      expect(prisma.education.create).toHaveBeenCalledWith({
        data: {
          major: 'CS',
          institution: 'UIT',
          startedAt: new Date('2020-01-01'),
          endedAt: new Date('2024-01-01'),
          huberId: 1,
          type: undefined,
          isPublic: false,
        },
        omit: { deletedAt: true, createdAt: true, updatedAt: true },
      });
      expect(result).toEqual({ id: 8 });
    });

    it('should normalize a missing endedAt to null on update', async () => {
      prisma.education = {
        findUnique: jest.fn().mockResolvedValue({ id: 8, deletedAt: null }),
        update: jest.fn().mockResolvedValue({ id: 8 }),
      };

      await service.updateEducation(1, 8, { endedAt: '' });

      expect(prisma.education.update).toHaveBeenCalledWith({
        where: { id: 8 },
        data: { endedAt: null },
        omit: { deletedAt: true, createdAt: true, updatedAt: true },
      });
    });

    it('should treat a deleted education as not found', async () => {
      prisma.education = {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 8, deletedAt: new Date() }),
        update: jest.fn(),
      };

      await expect(
        service.updateEducation(1, 8, { major: 'X' }),
      ).rejects.toThrow(NotFoundException);
      await expect(service.deleteEducation(1, 8)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should soft-delete the education', async () => {
      prisma.education = {
        findUnique: jest.fn().mockResolvedValue({ id: 8, deletedAt: null }),
        update: jest.fn().mockResolvedValue({ id: 8 }),
      };

      await service.deleteEducation(1, 8);

      expect(prisma.education.update).toHaveBeenCalledWith({
        where: { id: 8 },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('works', () => {
    it('should only allow human books to add work', async () => {
      prisma.user = {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 1, roleId: RoleEnum.reader }),
      };

      await expect(
        service.addWork(1, {
          position: 'Dev',
          company: 'ACME',
          startedAt: '2020-01-01',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create the work entry', async () => {
      prisma.user = {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 1, roleId: RoleEnum.humanBook }),
      };
      prisma.work = { create: jest.fn().mockResolvedValue({ id: 5 }) };

      const result = await service.addWork(1, {
        position: 'Dev',
        company: 'ACME',
        startedAt: '2020-01-01',
      });

      expect(prisma.work.create).toHaveBeenCalledWith({
        data: {
          position: 'Dev',
          company: 'ACME',
          startedAt: new Date('2020-01-01'),
          endedAt: null,
          huberId: 1,
        },
        omit: { deletedAt: true, createdAt: true, updatedAt: true },
      });
      expect(result).toEqual({ id: 5 });
    });

    it('should throw when the work is missing or deleted on update', async () => {
      prisma.work = {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      };

      await expect(service.updateWork(1, 5, { position: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should soft-delete the work', async () => {
      prisma.work = {
        findUnique: jest.fn().mockResolvedValue({ id: 5, deletedAt: null }),
        update: jest.fn().mockResolvedValue({ id: 5 }),
      };

      await service.deleteWork(1, 5);

      expect(prisma.work.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('updateTopics', () => {
    it('should do nothing for an empty list', async () => {
      prisma.$transaction = jest.fn();

      await service.updateTopics(1, []);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should replace the sharing topics in a transaction', async () => {
      const tx = {
        $executeRaw: jest.fn().mockResolvedValue(undefined),
        humanBookTopic: { createMany: jest.fn().mockResolvedValue(undefined) },
      };
      prisma.$transaction = jest.fn((callback) => callback(tx));

      await service.updateTopics(1, [1, 2]);

      expect(tx.$executeRaw).toHaveBeenCalled();
      expect(tx.humanBookTopic.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, topicId: 1 },
          { userId: 1, topicId: 2 },
        ],
      });
    });
  });
});
