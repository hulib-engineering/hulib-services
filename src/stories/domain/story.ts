import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/domain/user';
import { FileType } from '@files/domain/file';
import { StoryReviewOverview } from '@story-reviews/entities/story-review-overview';
import { Topic } from '@topics/domain/topics';
import { PublishStatus } from '@stories/status.enum';

const idType = Number;

export class Story {
  @ApiProperty({
    type: idType,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Some abstract line',
  })
  abstract?: string | null;

  @ApiProperty({
    type: String,
    example: 'Some title',
  })
  title: string;

  @ApiProperty({
    type: () => FileType,
  })
  cover?: FileType | null;

  @ApiProperty({
    type: () => User,
  })
  humanBook: User;

  @ApiProperty({
    type: () => StoryReviewOverview,
  })
  storyReview?: StoryReviewOverview | null;

  @ApiProperty({
    type: () => [Topic],
  })
  topics?: Topic[] | null;

  @ApiProperty({
    type: String,
    example: PublishStatus[1],
  })
  publishStatus: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: String,
    example: 'Reject reason',
  })
  rejectionReason?: string;
}
