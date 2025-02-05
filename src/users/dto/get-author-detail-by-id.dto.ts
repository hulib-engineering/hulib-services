import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@roles/domain/role';
import { Status } from '@statuses/domain/status';
import { Gender } from '@genders/domain/gender';

export class GetAuthorDetailByIdDto {
  @ApiProperty()
  id: number | string;

  @ApiProperty()
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @ApiProperty()
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty()
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty()
  fullName: string | null;

  @ApiProperty()
  gender?: Gender | null;

  @ApiProperty()
  birthday?: string | null;

  @ApiProperty()
  role?: Role | null;

  @ApiProperty()
  status?: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
