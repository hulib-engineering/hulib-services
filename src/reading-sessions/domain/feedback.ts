import { ApiProperty } from '@nestjs/swagger';
import { ReadingSession } from './reading-session';

export class Feedback {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  readingSessionId: number;

  @ApiProperty({
    type: () => ReadingSession,
  })
  readingSession: ReadingSession;

  @ApiProperty({
    type: Number,
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Great session, learned a lot!',
  })
  content?: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
  })
  deletedAt?: Date;
}
