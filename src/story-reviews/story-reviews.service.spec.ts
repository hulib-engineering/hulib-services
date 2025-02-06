import { Test, TestingModule } from '@nestjs/testing';
import { StoryReviewsService } from './story-reviews.service';
import { PrismaService } from '@prisma-client/prisma-client.service';

describe('StoryReviewsService', () => {
  let service: StoryReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoryReviewsService, PrismaService],
    }).compile();

    service = module.get<StoryReviewsService>(StoryReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
