import {
  ConflictException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { PublishStatus } from './status.enum';
import { RoleEnum } from '@roles/roles.enum';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

describe('StoriesService', () => {
  let service: StoriesService;
  let storiesRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findByIds: jest.Mock;
    findRelatedTopics: jest.Mock;
    update: jest.Mock;
    findAllWithCountAndPagination: jest.Mock;
  };
  let storyReviewService: { getReviewsOverview: jest.Mock };
  let topicsRepository: { findByIds: jest.Mock };
  let notifsService: { getAdminId: jest.Mock; pushNoti: jest.Mock };
  let cacheService: { get: jest.Mock; set: jest.Mock };
  let prisma: {
    story: { findUnique: jest.Mock };
    $queryRaw: jest.Mock;
    $executeRaw: jest.Mock;
  };
  let mailQueue: { add: jest.Mock };

  const makeStoryRow = (overrides: Record<string, unknown> = {}): any =>
    ({
      id: 1,
      title: 'T',
      abstract: 'A',
      humanBookId: 10,
      publishStatus: PublishStatus.published,
      topics: [],
      cover: null,
      humanBook: { feedbackTos: [], _count: { humanBookTopic: 0 } },
      viewCount: 0,
      shareCount: 0,
      likeCount: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    }) as never;

  beforeEach(() => {
    storiesRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findRelatedTopics: jest.fn(),
      update: jest.fn(),
      findAllWithCountAndPagination: jest.fn(),
    };
    storyReviewService = { getReviewsOverview: jest.fn() };
    topicsRepository = { findByIds: jest.fn() };
    notifsService = { getAdminId: jest.fn(), pushNoti: jest.fn() };
    cacheService = { get: jest.fn(), set: jest.fn() };
    prisma = {
      story: { findUnique: jest.fn() },
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
    };
    mailQueue = { add: jest.fn() };
    service = new StoriesService(
      storiesRepository as never,
      storyReviewService as never,
      topicsRepository as never,
      notifsService as never,
      cacheService as never,
      prisma as never,
      mailQueue as never,
    );
  });

  describe('create', () => {
    it('should default to pending and notify the admin on success', async () => {
      topicsRepository.findByIds.mockResolvedValue([]);
      storiesRepository.create.mockResolvedValue({
        id: 7,
        title: 'T',
        humanBook: { email: 'a@b.com', fullName: 'Huber' },
      });
      notifsService.getAdminId.mockResolvedValue(1);

      await service.create(5, { title: 'T' } as never);

      expect(storiesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publishStatus: 'pending',
          humanBook: { id: 5 },
          topics: [],
        }),
      );
      expect(notifsService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationTypeEnum.publishStory,
          relatedEntityId: 7,
        }),
      );
    });

    it('should enqueue the submitted e-mail with the human book address', async () => {
      topicsRepository.findByIds.mockResolvedValue([]);
      storiesRepository.create.mockResolvedValue({
        id: 7,
        title: 'T',
        humanBook: { email: 'a@b.com', fullName: 'Huber' },
      });
      notifsService.getAdminId.mockResolvedValue(1);

      await service.create(5, { title: 'T' } as never);
      await new Promise((resolve) => setImmediate(resolve));

      expect(mailQueue.add).toHaveBeenCalledWith(
        'story-submitted',
        expect.objectContaining({ to: 'a@b.com' }),
      );
    });
  });

  describe('createFirst', () => {
    it('should notify the admin with the account type', async () => {
      topicsRepository.findByIds.mockResolvedValue([]);
      storiesRepository.create.mockResolvedValue({
        id: 8,
        humanBook: { email: 'b@c.com', fullName: 'Reader' },
      });
      notifsService.getAdminId.mockResolvedValue(1);

      await service.createFirst(3, { title: 'X' } as never);

      expect(notifsService.pushNoti).toHaveBeenCalledWith(
        expect.objectContaining({ type: NotificationTypeEnum.account }),
      );
    });
  });

  describe('findAllWithCountAndPagination', () => {
    it('should delegate with the provided options', async () => {
      storiesRepository.findAllWithCountAndPagination.mockResolvedValue({
        data: [],
        count: 0,
      });
      const options = {
        paginationOptions: { page: 1, limit: 10 },
        filterOptions: { publishStatus: PublishStatus.published },
      };
      await expect(
        service.findAllWithCountAndPagination(options),
      ).resolves.toEqual({ data: [], count: 0 });
      expect(
        storiesRepository.findAllWithCountAndPagination,
      ).toHaveBeenCalledWith(options);
    });
  });

  describe('findOne', () => {
    it('should throw UnprocessableEntity when the story is not found', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(service.findOne(9)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntity when the story is deleted', async () => {
      prisma.story.findUnique.mockResolvedValue(
        makeStoryRow({ publishStatus: PublishStatus.deleted }),
      );

      await expect(service.findOne(1)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });
  });

  describe('update', () => {
    it('should throw UnprocessableEntity when the story does not exist', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(
        service.update(9, { title: 'X' } as never, { id: 10, roleId: 2 }),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });

    it('should throw Forbidden when a non-owner edits the story', async () => {
      prisma.story.findUnique.mockResolvedValue(makeStoryRow());
      prisma.$queryRaw.mockResolvedValue([{}]);
      storyReviewService.getReviewsOverview.mockResolvedValue({});

      await expect(
        service.update(1, { title: 'X' } as never, {
          id: 5,
          roleId: RoleEnum.reader,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw Forbidden when a non-admin tries to publish', async () => {
      prisma.story.findUnique.mockResolvedValue(makeStoryRow());
      prisma.$queryRaw.mockResolvedValue([{}]);
      storyReviewService.getReviewsOverview.mockResolvedValue({});

      await expect(
        service.update(1, { publishStatus: 'published' } as never, {
          id: 10,
          roleId: RoleEnum.humanBook,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should allow the owner to edit their own draft', async () => {
      prisma.story.findUnique.mockResolvedValue(
        makeStoryRow({ publishStatus: PublishStatus.pending }),
      );
      prisma.$queryRaw.mockResolvedValue([{}]);
      storyReviewService.getReviewsOverview.mockResolvedValue({});
      storiesRepository.update.mockResolvedValue({ id: 1 });

      await service.update(1, { title: 'New title' } as never, {
        id: 10,
        roleId: RoleEnum.humanBook,
      });

      expect(storiesRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: 'New title' }),
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete by setting publishStatus to deleted', async () => {
      storiesRepository.update.mockResolvedValue({ id: 1 });

      await service.remove(1);

      expect(storiesRepository.update).toHaveBeenCalledWith(1, {
        publishStatus: 'deleted',
      });
    });
  });

  describe('findDetailedStory', () => {
    it('should throw UnprocessableEntity when the story is not found', async () => {
      storiesRepository.findById.mockResolvedValue(null);

      await expect(service.findDetailedStory(9)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('should return the story when found', async () => {
      storiesRepository.findById.mockResolvedValue({ id: 1 });

      await expect(service.findDetailedStory(1)).resolves.toEqual({ id: 1 });
    });
  });

  describe('getTopics', () => {
    it('should delegate to findRelatedTopics', async () => {
      storiesRepository.findRelatedTopics.mockResolvedValue([{ id: 2 }]);

      await expect(service.getTopics(1)).resolves.toEqual([{ id: 2 }]);
      expect(storiesRepository.findRelatedTopics).toHaveBeenCalledWith(1);
    });
  });

  describe('share', () => {
    it('should throw UnprocessableEntity when the story does not exist', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await expect(service.share(9, 5)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('should throw Conflict when the user already shared the story', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { id: 1, sharedUserIds: [5], humanBookId: 10 },
      ]);

      await expect(service.share(1, 5)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
