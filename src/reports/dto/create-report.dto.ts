import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateReportDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  reportedUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
