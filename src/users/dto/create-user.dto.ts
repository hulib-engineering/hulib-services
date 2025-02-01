import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  // decorators here
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { FileDto } from '@files/dto/file.dto';
import { GenderDto } from '@genders/dto/gender.dto';
import { RoleDto } from '@roles/dto/role.dto';
import { StatusDto } from '@statuses/dto/status.dto';
import { lowerCaseTransformer } from '@utils/transformers/lower-case.transformer';
import { GenderEnum } from '@genders/genders.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null;

  @ApiProperty()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiProperty({ example: 'John Doe', type: String })
  @IsNotEmpty()
  fullName: string | null;

  @ApiPropertyOptional({ example: { id: GenderEnum.other }, type: GenderDto })
  @IsOptional()
  @Type(() => GenderDto)
  gender?: GenderDto | null;

  @ApiProperty({ example: '1970-01-01' })
  @IsOptional()
  birthday?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  hash?: string | null;
}
