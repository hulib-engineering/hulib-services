import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ReadingSessionStatus } from '../../reading-sessions/domain';

export class GetUserReadingSessionsQueryDto {
  @ApiProperty({
    required: false,
    description: 'Filter reading sessions by status',
    default: ReadingSessionStatus.APPROVED,
    enum: ReadingSessionStatus,
  })
  @IsEnum(ReadingSessionStatus)
  sessionStatus: ReadingSessionStatus;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
