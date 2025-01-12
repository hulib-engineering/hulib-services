import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { User } from '../domain/user';

export class UserDto implements Partial<User> {
  @ApiProperty()
  @IsNumber()
  id: number | string;
}
