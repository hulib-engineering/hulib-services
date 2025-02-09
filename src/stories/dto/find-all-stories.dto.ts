import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { Story } from '@stories/domain/story';

export class SortStoryDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Story;

  @ApiProperty()
  @IsString()
  order: 'ASC' | 'DESC';
}

export class FilterStoryDto {
  @ApiPropertyOptional({
    type: String,
    example: '1',
  })
  @IsOptional()
  humanBookId?: string | null;

  @ApiPropertyOptional({
    example: [1, 2],
    type: [Number],
  })
  @Transform(({ value }) => value.split(',').map(Number))
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  topicIds?: number[] | null;
}

export class FindAllStoriesDto extends FilterStoryDto {
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

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(
          SortStoryDto,
          typeof value === 'string' ? JSON.parse(value) : value,
        )
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortStoryDto)
  sort?: SortStoryDto | null;

  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => FilterStoryDto)
  // filters?: FilterStoryDto | null;
}
