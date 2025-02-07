import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { Story } from '../domain/story';

export class SortStoryDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Story;

  @ApiProperty()
  @IsString()
  order: string;
}

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

  // @ApiPropertyOptional()
  // @IsOptional()
  // topicIds?: string[];

  // @ApiPropertyOptional()
  // @IsOptional()
  // filter?: {
  //   humanBook?: number;
  //   topics?: string;
  // };

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // sortBy?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortStoryDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortStoryDto)
  sort?: SortStoryDto[] | null;
}
