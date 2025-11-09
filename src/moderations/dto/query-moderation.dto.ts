import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ModerationActionType, ModerationStatus } from '../domain/moderation';

export class QueryModerationDto {
  @ApiProperty({
    description: 'Filter by user ID',
    type: Number,
    example: 1,
    required: true,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: ModerationActionType,
    example: ModerationActionType.warn,
  })
  @IsOptional()
  @IsEnum(ModerationActionType)
  actionType?: ModerationActionType;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ModerationStatus,
    example: ModerationStatus.active,
  })
  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;

  @ApiPropertyOptional({
    description: 'Filter by report ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  reportId?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    type: Number,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    type: Number,
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
