import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class AddWorkDto {
  @ApiProperty({
    description: 'Job position or title',
    example: 'Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp',
  })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({
    description: 'Start date of employment',
    example: '2020-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  startedAt: string;

  @ApiProperty({
    description: 'End date of employment (optional if current job)',
    example: '2023-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endedAt?: string;
}
