import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
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
}
