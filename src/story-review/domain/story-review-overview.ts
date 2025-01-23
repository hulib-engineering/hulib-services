import { ApiProperty } from '@nestjs/swagger';
import { StoryReviewHistogram } from './story-review-histogram';
import { StoryReview } from './story-review';

export class StoryReviewOverview {
  @ApiProperty({
    type: Number,
    example: 4,
  })
  rating?: number | null;

  @ApiProperty({
    type: Number,
    example: 125,
  })
  numberOfReviews?: number | null;

  @ApiProperty({
    type: () => [StoryReviewHistogram],
  })
  histogram?: StoryReviewHistogram[] | null;

  @ApiProperty()
  outStanding: StoryReview
}
