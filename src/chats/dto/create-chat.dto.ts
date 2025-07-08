import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChatTypeDto } from '@chat-types/dto/chat-type.dto';

export class CreateChatDto {
  @ApiProperty({
    type: String,
    example: 'hi',
  })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  message: string;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsNotEmpty({ message: 'Recipient ID is required' })
  @IsNumber(undefined, { message: 'Recipient ID must be a number' })
  recipientId: number;

  @ApiProperty({ type: ChatTypeDto })
  @IsNotEmpty()
  @Type(() => ChatTypeDto)
  chatType?: ChatTypeDto;
}
