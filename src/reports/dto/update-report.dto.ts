import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateReportDto {
  @ApiProperty({ default: true })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  })
  @IsBoolean()
  markAsResolved: boolean;

  @ApiPropertyOptional({
    type: String,
    example: 'Rejected reason 1. Rejected reason 2.',
  })
  @IsOptional()
  @IsString()
  rejectedReason?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Custom reason:...',
  })
  @IsOptional()
  @IsString()
  rejectedCustomReason?: string;
}
