import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReadingSessionDto {
  @ApiProperty()
  @IsNumber()
  humanBookId: number;

  @ApiProperty()
  @IsNumber()
  readerId: number;

  @ApiProperty()
  @IsNumber()
  storyId: number;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: '2025-03-30T13:30:08.248Z', type: String })
  @IsString()
  startedAt: string;

  @ApiProperty({ example: '2025-03-30T13:30:08.248Z', type: String })
  @IsString()
  endedAt: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note?: string;
}
