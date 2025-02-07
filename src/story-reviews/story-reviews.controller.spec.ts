import { Test, TestingModule } from '@nestjs/testing';
import { StoryReviewsController } from './story-reviews.controller';
import { StoryReviewsService } from './story-reviews.service';
import { PrismaService } from '@prisma-client/prisma-client.service';

describe('StoryReviewsController', () => {
  let controller: StoryReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoryReviewsController],
      providers: [StoryReviewsService, PrismaService],
    }).compile();

    controller = module.get<StoryReviewsController>(StoryReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
