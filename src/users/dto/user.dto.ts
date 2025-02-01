import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { User } from '@users/domain/user';

export class UserDto implements Partial<User> {
  @ApiProperty()
  @IsNumber()
  id: number | string;
}
