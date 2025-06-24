import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpgradeDto {
  @ApiProperty({
    example: 'accept',
    description: 'The action to perform: accept, reject',
    required: true,
    type: String,
    format: 'string',
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({
    example: 'Huber information is invalid',
    type: String,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
