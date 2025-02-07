import { ApiProperty } from '@nestjs/swagger';
import { StoryReviewHistogram } from './story-review-histogram';
import { StoryReview } from './story-review.entity';

export class StoryReviewOverview {
  @ApiProperty({
    type: Number,
    example: 4,
  })
  rating?: number | null;

  @ApiProperty({
    type: Number,
    example: 25,
  })
  numberOfReviews?: number | null;

  @ApiProperty({
    type: () => [StoryReviewHistogram],
  })
  histogram?: StoryReviewHistogram[] | null;

  @ApiProperty()
  outStanding: StoryReview | null;
}
