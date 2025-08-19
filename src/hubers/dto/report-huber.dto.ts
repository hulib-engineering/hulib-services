import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReportHuberDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  reasons: string;
}
