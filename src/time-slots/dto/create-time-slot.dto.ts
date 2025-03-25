import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  dayOfWeek: number;

  @ApiProperty({
    type: Number,
    example: 6.5,
  })
  @IsNumber()
  @IsNotEmpty()
  startTime: number;
}
