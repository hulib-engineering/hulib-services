import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { HuberQueryTypeEnum } from '../huber-query-type.enum';
import { PublishStatus } from '@stories/status.enum';

export class FindAllHubersDto {
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
  @IsArray()
  @Transform(({ value }) =>
    value
      ? Array.isArray(value)
        ? value.map((each: any) => Number(each))
        : [Number(value)]
      : [],
  )
  @IsOptional()
  topicIds?: number[];

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @ApiPropertyOptional({
    type: HuberQueryTypeEnum,
    enum: HuberQueryTypeEnum,
    description: 'Filter hubers by query type',
  })
  @IsOptional()
  @IsEnum(HuberQueryTypeEnum)
  type?: HuberQueryTypeEnum;
}
