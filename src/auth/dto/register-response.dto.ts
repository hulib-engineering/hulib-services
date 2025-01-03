import { ApiProperty } from '@nestjs/swagger';

const idType = Number;

export class RegisterResponseDto {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  code: string;
}
