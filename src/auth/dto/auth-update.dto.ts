import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';
import { FileDto } from '@files/dto/file.dto';
import { Transform, Type } from 'class-transformer';
import { lowerCaseTransformer } from '@utils/transformers/lower-case.transformer';
import { StatusDto } from '@statuses/dto/status.dto';
import { GenderEnum } from '@genders/genders.enum';
import { GenderDto } from '@genders/dto/gender.dto';

export class AuthUpdateDto {
  // @ApiPropertyOptional({ type: () => FileDto })
  // @IsOptional()
  // photo?: FileDto | null;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'new.email@example.com' })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @Transform(lowerCaseTransformer)
  email?: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ example: { id: GenderEnum.other }, type: GenderDto })
  @IsOptional()
  @Type(() => GenderDto)
  gender?: GenderDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  // @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  // @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '11234567890' })
  @IsOptional()
  @IsPhoneNumber()
  parentPhoneNumber?: string;

  @ApiPropertyOptional({ example: '11234567891' })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '1970-01-01',
    description: 'Birthday in ISO 8601 format (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'Birthday must be a valid date in YYYY-MM-DD format',
    },
  )
  birthday?: string | null;
}
