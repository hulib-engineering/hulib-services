import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    type: String,
    example: 'active',
  })
  @IsString()
  status: string;
}
