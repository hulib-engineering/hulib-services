import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { TopicDto } from '@topics/dto/topic.dto';

export class UpdateHumanBooksDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({
    type: () => [TopicDto],
    example: [{ id: 1 }, { id: 2 }],
  })
  @IsOptional()
  @IsArray()
  topics?: TopicDto[];

  @ApiProperty({
    type: String,
    example: '2011-10-05T14:48:00.000Z',
    description: 'ISO 8601',
  })
  @IsOptional()
  @IsString()
  educationStart?: string;

  @ApiProperty({
    type: String,
    example: '2011-10-05T14:48:00.000Z',
    description: 'ISO 8601',
  })
  @IsOptional()
  @IsString()
  educationEnd?: string;
}
