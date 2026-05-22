import { ApiProperty } from '@nestjs/swagger';
import { Topics } from '../domain/topics';
import { TopicColor } from '@topics/topic-color.enum';
import { TopicStatus } from '@topics/topic-status.enum';

export class TopicDto implements Partial<Topics> {
  @ApiProperty()
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
}
