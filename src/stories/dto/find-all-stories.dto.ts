import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllStoriesDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  @Max(50)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  topicIds?: string[];
}
