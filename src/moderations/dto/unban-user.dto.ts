import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UnbanUserDto {
  @ApiProperty({
    example: 1,
    description: 'User ID to unban',
  })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    example: 46,
    description: 'Report ID associated with unban action',
  })
  @IsOptional()
  @IsInt()
  reportId?: number;
}
