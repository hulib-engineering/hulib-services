import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckSessionAvailabilityDto {
  @ApiProperty({ example: new Date(), type: Date })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startAt: Date;
}
