import { ApiProperty } from '@nestjs/swagger';
import { Topics } from '../domain/topics';

export class TopicDto implements Partial<Topics> {
  @ApiProperty()
  id: number;
}
