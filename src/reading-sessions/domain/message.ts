import { ApiProperty } from '@nestjs/swagger';
import { ReadingSession } from './reading-session';
import { User } from '../../users/domain/user';

export class Message {
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
    example: 1,
  })
  humanBookId: number;

  @ApiProperty({
    type: () => User,
  })
  humanBook: User;

  @ApiProperty({
    type: Number,
    example: 2,
  })
  readerId: number;

  @ApiProperty({
    type: () => User,
  })
  reader: User;

  @ApiProperty({
    type: String,
    example: 'Looking forward to our session!',
  })
  content: string;

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
