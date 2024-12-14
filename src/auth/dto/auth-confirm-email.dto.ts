import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AuthConfirmEmailDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
