import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenerateContestReportDto {
  @ApiPropertyOptional({
    example: 'khoang khac',
    description: 'Topic name prefix to filter stories',
  })
  @IsOptional()
  @IsString()
  topic?: string;
}
