import { Test, TestingModule } from '@nestjs/testing';
import { StoryReviewsService } from './story-reviews.service';

describe('StoryReviewsService', () => {
  let service: StoryReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoryReviewsService],
    }).compile();

    service = module.get<StoryReviewsService>(StoryReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
