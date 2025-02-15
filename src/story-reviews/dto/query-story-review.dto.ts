import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationInputDto } from '@utils/dto/pagination-input.dto';
import { Transform } from 'class-transformer';

export class QueryStoryReviewDto extends PaginationInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  storyId?: number;

  // @ApiPropertyOptional()
  // @IsOptional()
  // sort?: Record<string, any>;
}
