import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TopicColor } from '@topics/topic-color.enum';
import { TopicStatus } from '@topics/topic-status.enum';

export class CreateTopicsDto {
  @ApiProperty({
    example: 'Hulib never die',
    description: 'The name of the topic',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: TopicColor,
    example: TopicColor.primary,
    description: 'Preset color for the topic tag preview',
    required: false,
    default: TopicColor.primary,
  })
  @IsOptional()
  @IsEnum(TopicColor)
  color?: TopicColor;

  @ApiProperty({
    enum: TopicStatus,
    example: TopicStatus.inactive,
    description: 'New topics default to inactive until activated by admin',
    required: false,
    default: TopicStatus.inactive,
  })
  @IsOptional()
  @IsEnum(TopicStatus)
  status?: TopicStatus;
}
