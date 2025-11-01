import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    example: 1,
    description: 'User ID to ban',
  })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    example: 45,
    description: 'Report ID that triggered this ban',
  })
  @IsOptional()
  @IsInt()
  reportId?: number;
}