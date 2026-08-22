import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { PublishStatus } from '@stories/status.enum';
import { StoriesService } from '@stories/stories.service';

import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: { user: { findMany: jest.Mock }; $queryRaw: jest.Mock };
  let storiesService: { findAllWithCountAndPagination: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn().mockResolvedValue([]) },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
    storiesService = {
      findAllWithCountAndPagination: jest
        .fn()
        .mockResolvedValue({ data: [], count: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prisma },
        { provide: StoriesService, useValue: storiesService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  describe('getStoryIdsByKeyword', () => {
    it('should return empty array for empty / whitespace-only / null keyword', async () => {
      await expect(service.getStoryIdsByKeyword('')).resolves.toEqual([]);
      await expect(service.getStoryIdsByKeyword('   ')).resolves.toEqual([]);
      await expect(service.getStoryIdsByKeyword(null)).resolves.toEqual([]);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('should escape LIKE wildcard characters in the keyword', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 1 }]);

      await service.getStoryIdsByKeyword('100% done_\\');

      const params = prisma.$queryRaw.mock.calls[0].slice(1);
      expect(params).toContain('100\\% done\\_\\\\');
    });

    it('should map matched rows to story ids', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 3 }, { id: 7 }]);

      await expect(service.getStoryIdsByKeyword('hai vì sao')).resolves.toEqual(
        [3, 7],
      );
    });
  });

  describe('searchByKeyword', () => {
    it('should return empty stories without querying the listing pipeline when nothing matches', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      const result = await service.searchByKeyword({ keyword: 'không có' });

      expect(result.stories).toEqual([]);
      expect(result.hubers).toEqual([]);
      expect(
        storiesService.findAllWithCountAndPagination,
      ).not.toHaveBeenCalled();
    });

    it('should reuse the GET /stories pipeline for matched story ids', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 5 }, { id: 9 }]);
      const story = { id: 5 };
      storiesService.findAllWithCountAndPagination.mockResolvedValue({
        data: [story],
        count: 1,
      });

      const result = await service.searchByKeyword({ keyword: 'hai vì sao' });

      expect(storiesService.findAllWithCountAndPagination).toHaveBeenCalledWith(
        {
          paginationOptions: { page: 1, limit: 2 },
          filterOptions: {
            ids: [5, 9],
            publishStatus: PublishStatus.published,
          },
        },
      );
      expect(result.stories).toEqual([story]);
    });

    it('should still search hubers when keyword is missing', async () => {
      const hubers = [{ id: 2 }];
      prisma.user.findMany.mockResolvedValue(hubers);

      const result = await service.searchByKeyword({});

      expect(result.stories).toEqual([]);
      expect(result.hubers).toEqual(hubers);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });
});
