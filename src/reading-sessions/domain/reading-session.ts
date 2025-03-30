import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Story } from '../../stories/domain/story';
import { Feedback } from './feedback';
import { Message } from './message';

export enum ReadingSessionStatus {
  FINISHED = 'finished',
  UNINITIALIZED = 'unInitialized',
  CANCELED = 'canceled',
  PENDING = 'pending',
}

export class ReadingSession {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

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
    type: Number,
    example: 1,
  })
  storyId: number;

  @ApiProperty({
    type: () => Story,
  })
  story: Story;

  @ApiProperty({
    type: String,
    example: 'https://meet.google.com/abc-defg-hij',
  })
  sessionUrl: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'I would like to learn more about your experience',
  })
  note?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Great session with insightful discussions',
  })
  review?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'https://drive.google.com/file/d/123/view',
  })
  recordingUrl?: string;

  @ApiProperty({
    enum: ReadingSessionStatus,
    example: ReadingSessionStatus.PENDING,
  })
  sessionStatus: ReadingSessionStatus;

  @ApiProperty({
    type: String,
    example: '12:00',
  })
  startTime: string;

  @ApiProperty({
    type: String,
    example: '12:30',
  })
  endTime: string;

  @ApiProperty({
    type: Date,
  })
  startedAt: Date;

  @ApiProperty({
    type: Date,
  })
  endedAt: Date;

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

  @ApiProperty({
    type: [Feedback],
  })
  feedbacks: Feedback[];

  @ApiProperty({
    type: [Message],
  })
  messages: Message[];
}
