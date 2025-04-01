import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingSessionDto } from './create-reading-session.dto';
import { ReadingSessionStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReadingSessionDto extends PartialType(
  CreateReadingSessionDto,
) {
  @ApiProperty({
    type: String,
    example: 'FINISHED',
  })
  @IsOptional()
  @IsEnum(ReadingSessionStatus)
  sessionStatus?: ReadingSessionStatus;
}
