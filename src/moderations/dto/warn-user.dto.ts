import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class WarnUserDto {
  @ApiProperty({
    description: 'ID of the user to warn',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID of the report that triggered this warning',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  reportId?: number;
}
