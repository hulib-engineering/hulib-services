import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { lowerCaseTransformer } from '@utils/transformers/lower-case.transformer';
import { GenderDto } from '@genders/dto/gender.dto';
import { GenderEnum } from '@genders/genders.enum';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', type: String })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: GenderDto, example: { id: GenderEnum.other } })
  @IsNotEmpty()
  @Type(() => GenderDto)
  gender: GenderDto;

  @ApiProperty({ example: '1970-01-01' })
  @IsNotEmpty()
  birthday: string;

  @ApiProperty({ example: '11234567890' })
  @IsOptional()
  @IsNotEmpty()
  parentPhoneNumber?: string;
}
