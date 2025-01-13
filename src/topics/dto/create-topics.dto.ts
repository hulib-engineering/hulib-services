import { IsString } from 'class-validator';

export class CreateTopicsDto {
  @IsString()
  name: string;
}
