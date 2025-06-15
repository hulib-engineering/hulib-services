import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindQueryNotificationsDto {
  @Type(() => Number)
  @IsNumber()
  recipientId: number;
}
