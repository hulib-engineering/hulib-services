import { ApiProperty } from '@nestjs/swagger';
import { StoryReview } from '../entities/story-review.entity';

export class RatingOverviewDto {
  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty()
  ratingDistribution: Record<number, number>;

  @ApiProperty({ type: StoryReview })
  outstandingReview: StoryReview;
}
