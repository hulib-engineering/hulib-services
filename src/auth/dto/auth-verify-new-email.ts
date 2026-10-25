import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsString, Matches } from 'class-validator';

export class VerifyNewEmailDto {
  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({ example: 'new.email@example.com' })
  @IsEmail()
  newEmail: string;

  @ApiProperty({
    example: '004281',
    description: '4- or 6-digit OTP',
  })
  @IsString()
  @Matches(/^(\d{4}|\d{6})$/, {
    message: 'OTP must be exactly 4 or 6 digits',
  })
  otp: string;
}