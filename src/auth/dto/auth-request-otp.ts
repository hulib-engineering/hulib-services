import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';

export class RequestOTPDto {
  @ApiProperty({ example: 123 })
  @IsNotEmpty()
  id: number | string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: [4, 6], default: 6, required: false })
  @IsIn([4, 6])
  digits?: number = 6;
}