import { ApiProperty } from '@nestjs/swagger';
import { TopicColor } from '@topics/topic-color.enum';
import { TopicStatus } from '@topics/topic-status.enum';

export class Topic {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: TopicColor,
    example: TopicColor.primary,
  })
  color: TopicColor;

  @ApiProperty({
    enum: TopicStatus,
    example: TopicStatus.inactive,
  })
  status: TopicStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class Topics extends Topic {}
