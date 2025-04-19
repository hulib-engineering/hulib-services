import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTopicsDto {
  @ApiProperty({
    example: 'Hulib never die',
    description: 'The name of the topic',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
