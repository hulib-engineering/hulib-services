import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsBoolean } from 'class-validator';

const idType = Number;

export class Report {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'Reason 1. Reason 2.',
  })
  reason: string;

  @ApiProperty({
    type: String,
    example: 'Custom reason:...',
  })
  customReason?: string | null;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  markAsResolved: boolean;

  @ApiProperty({
    type: String,
    example: 'Rejected reason 1. Rejected reason2.',
  })
  rejectedReason?: string | null;

  @ApiProperty({
    type: String,
    example: 'Custom rejected reason:...',
  })
  rejectedCustomReason?: string | null;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;
}
