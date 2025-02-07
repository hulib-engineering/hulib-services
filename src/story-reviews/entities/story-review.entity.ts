import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/domain/user';

export class StoryReview {
  @ApiProperty()
  id: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  comment: string;

  @ApiProperty({
    type: () => User,
    description: 'The user who wrote the review',
  })
  user: User;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
