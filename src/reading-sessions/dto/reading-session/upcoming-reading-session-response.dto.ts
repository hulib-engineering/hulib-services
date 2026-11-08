import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FileType } from '@files/domain/file';
import { ReadingSessionStatus } from '../../domain';

export class UpcomingReadingSessionCounterpartRoleDto {
  @ApiProperty({
    type: Number,
    example: 3,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'reader',
  })
  name?: string;
}

export class UpcomingReadingSessionCounterpartDto {
  @ApiProperty({
    type: Number,
    example: 2,
  })
  id: number;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'John Doe',
  })
  fullName: string | null;

  @ApiProperty({
    type: () => FileType,
    nullable: true,
  })
  @Type(() => FileType)
  photo: FileType | null;

  @ApiProperty({
    type: () => UpcomingReadingSessionCounterpartRoleDto,
    nullable: true,
  })
  @Type(() => UpcomingReadingSessionCounterpartRoleDto)
  role: UpcomingReadingSessionCounterpartRoleDto | null;
}

export class UpcomingReadingSessionResponseDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    enum: ReadingSessionStatus,
    example: ReadingSessionStatus.APPROVED,
  })
  sessionStatus: ReadingSessionStatus;

  @ApiProperty({
    type: Date,
  })
  startedAt: Date;

  @ApiProperty({
    type: Date,
  })
  endedAt: Date;

  @ApiProperty({
    type: () => UpcomingReadingSessionCounterpartDto,
  })
  @Type(() => UpcomingReadingSessionCounterpartDto)
  counterpart: UpcomingReadingSessionCounterpartDto;
}

export class UpcomingReadingSessionsMetaDto {
  @ApiProperty({
    type: Number,
    example: 2,
  })
  count: number;

  @ApiProperty({
    type: String,
    example: '2026-11-01T13:46:00.000Z',
  })
  serverTime: string;
}

export class UpcomingReadingSessionsResponseDto {
  @ApiProperty({
    type: () => [UpcomingReadingSessionResponseDto],
  })
  @Type(() => UpcomingReadingSessionResponseDto)
  data: UpcomingReadingSessionResponseDto[];

  @ApiProperty({
    type: () => UpcomingReadingSessionsMetaDto,
  })
  @Type(() => UpcomingReadingSessionsMetaDto)
  meta: UpcomingReadingSessionsMetaDto;
}
