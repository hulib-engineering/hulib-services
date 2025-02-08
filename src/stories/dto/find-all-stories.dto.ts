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
import { UserDto } from '@users/dto/user.dto';
import { TopicDto } from '@topics/dto/topic.dto';

export class SortStoryDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Story;

  @ApiProperty()
  @IsString()
  order: string;
}

export class FilterStoryDto {
  @ApiPropertyOptional({
    type: UserDto,
    example: { id: '8686' },
  })
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  humanBook: UserDto | null;

  @ApiPropertyOptional({
    type: () => [TopicDto],
    example: [{ id: 1 }, { id: 2 }],
  })
  @ValidateNested({ each: true })
  @IsArray()
  topics?: TopicDto[] | null;
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

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortStoryDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortStoryDto)
  sort?: SortStoryDto[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterStoryDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => FilterStoryDto)
  filters?: FilterStoryDto | null;
}

export class SearchStoriesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: string;
}
