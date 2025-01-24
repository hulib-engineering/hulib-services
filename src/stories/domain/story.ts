import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { FileType } from '../../files/domain/file';
import { StoryReviewOverview } from '../../story-review/domain/story-review-overview';

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
    type: Number,
    example: 4,
    deprecated: true,
  })
  rating?: number | null;

  @ApiProperty({
    type: () => StoryReviewOverview,
  })
  storyReview?: StoryReviewOverview | null;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the story is favorited by the current user',
  })
  isFavorited?: boolean | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
