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
import { RoleDto } from '../../roles/dto/role.dto';

export class AuthUpdateDto {
  @ApiPropertyOptional({ example: 'new.email@example.com' })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @Transform(lowerCaseTransformer)
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  fullName?: string;

  @ApiPropertyOptional({ example: { id: GenderEnum.other }, type: GenderDto })
  @IsOptional()
  @Type(() => GenderDto)
  gender?: GenderDto | null;

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

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  @ApiPropertyOptional({ example: '11234567890' })
  @IsOptional()
  @IsPhoneNumber()
  parentPhoneNumber?: string;

  @ApiPropertyOptional({ example: '11234567891' })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

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

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  bio?: string | null;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  videoUrl?: string | null;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  education?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: '2011-10-05T14:48:00.000Z',
    description: 'ISO 8601',
  })
  @IsOptional()
  educationStart: string | null;

  @ApiPropertyOptional({
    type: String,
    example: '2011-10-05T14:48:00.000Z',
    description: 'ISO 8601',
  })
  @IsOptional()
  educationEnd?: string | null;
}
