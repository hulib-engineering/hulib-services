import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateLanguageDto {
  @ApiProperty({
    type: String,
    example: 'en',
    enum: ['en', 'vi'],
  })
  @IsIn(['en', 'vi'])
  language: 'en' | 'vi';
}
