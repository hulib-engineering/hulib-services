import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class AddEducationDto {
  @ApiProperty({
    description: 'Major or field of study',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  major: string;

  @ApiProperty({
    description: 'Educational institution name',
    example: 'University of Technology',
  })
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiProperty({
    description: 'Start date of education',
    example: '2020-09-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startedAt: string;

  @ApiProperty({
    description: 'End date of education (optional if ongoing)',
    example: '2024-06-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endedAt?: string;
}
