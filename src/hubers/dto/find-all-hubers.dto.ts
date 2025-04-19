import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
}
