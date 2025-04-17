import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { TopicDto } from '@topics/dto/topic.dto';

export class RegisterToHumanBookDto {
  @ApiProperty()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsString()
  videoUrl: string;

  @ApiProperty({
    type: String,
    example: 'HCMUT',
    description: 'Education',
  })
  @IsString()
  @IsOptional()
  education: string | null;

  @ApiProperty({
    type: () => [TopicDto],
    example: [{ id: 1 }, { id: 2 }],
  })
  @IsArray()
  @IsOptional()
  topics: TopicDto[] | null;

  @ApiProperty({
    type: String,
    example: '2011-10-05T14:48:00.000Z',
    description: 'ISO 8601',
  })
  @IsString()
  @IsOptional()
  educationStart: string | null;

  @ApiProperty({
    type: String,
    example: '2011-10-05T14:48:00.000Z',
    description: 'ISO 8601',
  })
  @IsOptional()
  @IsString()
  educationEnd?: string | null;
}
