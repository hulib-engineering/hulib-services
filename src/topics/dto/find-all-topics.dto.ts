import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { TopicQueryTypeEnum } from '@topics/topic-query-type.enum';

export class FindAllTopicsDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: TopicQueryTypeEnum,
    enum: TopicQueryTypeEnum,
    description: 'Filter topics by query type',
  })
  @IsOptional()
  @IsEnum(TopicQueryTypeEnum)
  type?: TopicQueryTypeEnum;
}
