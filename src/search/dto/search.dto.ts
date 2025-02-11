import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;
}
