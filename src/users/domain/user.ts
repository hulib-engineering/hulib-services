import { Exclude, Expose } from 'class-transformer';
import { FileType } from '@files/domain/file';
import { Role } from '@roles/domain/role';
import { Status } from '@statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@genders/domain/gender';
import { Topics } from '@topics/domain/topics';
import { Approval } from '@users/approval.enum';

const idType = Number;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  previousPassword?: string;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  fullName: string | null;

  @ApiProperty({
    type: () => Gender,
  })
  gender?: Gender | null;

  @ApiProperty({
    type: String,
    example: '1970-01-01',
  })
  birthday?: string | null;

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null;

  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null;

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty({
    type: String,
    example: '11234567890',
  })
  parentPhoneNumber?: string | null;

  @ApiProperty({
    type: String,
    example: '11234567891',
  })
  phoneNumber?: string | null;

  @ApiProperty({
    type: String,
  })
  address?: string | null;

  @ApiProperty({
    type: String,
    example: Approval.pending,
  })
  approval?: string | null;

  @ApiProperty({
    type: String,
    example: 'Lorem ipsum dolor sit amet',
  })
  bio?: string | null;

  @ApiProperty({
    type: String,
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  videoUrl?: string | null;

  @ApiProperty({
    type: String,
    example: 'Lorem ipsum dolor sit amet',
  })
  education?: string | null;

  @ApiProperty({
    type: Date,
    example: '2011-10-05T14:48:00.000Z',
  })
  educationStart?: Date | null;

  @ApiProperty({
    type: Date,
    example: '2011-10-05T14:48:00.000Z',
  })
  educationEnd?: Date | null;

  @ApiProperty({
    type: () => [Topics],
  })
  topics?: Topics[];

  @ApiProperty({
    type: Number,
    example: 4,
  })
  countTopics?: number;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;
}
