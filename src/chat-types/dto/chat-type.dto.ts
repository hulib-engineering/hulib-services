import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { ChatType } from '../domain/chat-type';

export class ChatTypeDto implements ChatType {
  @ApiProperty()
  @IsNumber()
  id: number;
}
