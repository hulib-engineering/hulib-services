import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserDto } from '../../users/dto/user.dto';
import { TopicDto } from '../../topics/dto/topic.dto';

export class CreateHumanBooksDto {
  @ApiProperty()
  @IsNumber()
  user: UserDto;

  @ApiProperty()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsString()
  videoUrl: string;

  @ApiProperty({
    type: () => [TopicDto],
  })
  @IsArray()
  topics: TopicDto[];

  @ApiProperty()
  @IsString()
  education: string;

  @ApiProperty()
  @IsDate()
  educationStart: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  educationEnd?: Date | null;
}
