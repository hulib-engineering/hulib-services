import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UnwarnUserDto {
  @ApiProperty({
    description: 'ID of the user to remove warning from',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID of the report associated with this warning removal',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  reportId?: number;
}
