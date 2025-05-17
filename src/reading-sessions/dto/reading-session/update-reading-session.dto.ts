import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingSessionDto } from './create-reading-session.dto';
import { ReadingSessionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReadingSessionDto extends PartialType(
  CreateReadingSessionDto,
) {
  @ApiProperty({
    enum: ReadingSessionStatus,
    example: ReadingSessionStatus.finished,
    description: 'The status of the reading session',
  })
  @IsOptional()
  @IsEnum(ReadingSessionStatus)
  sessionStatus?: ReadingSessionStatus;

  @ApiPropertyOptional({
    example: 'Reason for canceling the reading session',
    description: 'Note or reason when canceling the reading session',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
