import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EducationType } from '@prisma/client';

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

  @ApiPropertyOptional({
    description: 'End date of education (optional if ongoing)',
    example: '2024-06-01',
  })
  @IsDateString()
  @IsOptional()
  endedAt?: string;

  @ApiPropertyOptional({
    enum: EducationType,
    description:
      'vocational: Trung cấp, khóa học ngắn hạn, học nghề | university: Cao đẳng, Đại học & trên đại học | life_experience: Trường đời, trải nghiệm thực tế',
  })
  @IsEnum(EducationType)
  @IsOptional()
  type?: EducationType;

  @ApiPropertyOptional({
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
