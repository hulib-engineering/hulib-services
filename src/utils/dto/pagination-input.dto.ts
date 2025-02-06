import { IsOptional, IsNumber } from 'class-validator';
import { IPaginationOptionInput } from '../types/pagination-options';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export class PaginationInputDto implements IPaginationOptionInput {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : DEFAULT_PAGE))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : DEFAULT_LIMIT))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
