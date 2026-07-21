import { Test, TestingModule } from '@nestjs/testing';
import { StoryReviewsService } from './story-reviews.service';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { CacheService } from '../cache/cache.service';

describe('StoryReviewsService', () => {
  let service: StoryReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoryReviewsService,
        PrismaService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StoryReviewsService>(StoryReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
