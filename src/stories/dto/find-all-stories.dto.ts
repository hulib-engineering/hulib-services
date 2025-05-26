import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Story } from '@stories/domain/story';
import { PublishStatus } from '../status.enum';

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

  @ApiPropertyOptional()
  @IsArray()
  @Transform(({ value }) =>
    value
      ? Array.isArray(value)
        ? value.map((each) => Number(each))
        : [Number(value)]
      : [],
  )
  @IsOptional()
  topicIds?: number[];

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;
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

  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // @Transform(({ value }) => {
  //   return value
  //     ? plainToInstance(
  //         SortStoryDto,
  //         typeof value === 'string' ? JSON.parse(value) : value,
  //       )
  //     : undefined;
  // })
  // @ValidateNested({ each: true })
  // @Type(() => SortStoryDto)
  // sort?: SortStoryDto | null;

  // @ApiPropertyOptional({ type: String })
  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => FilterStoryDto)
  // filters?: FilterStoryDto | null;
}
