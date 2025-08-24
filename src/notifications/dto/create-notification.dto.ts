import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  relatedEntityId?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  extraNote?: string;
}
