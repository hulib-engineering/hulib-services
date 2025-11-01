import { ApiProperty } from '@nestjs/swagger';

export enum ModerationActionType {
  warn = 'warn',
  unwarn = 'unwarn',
  ban = 'ban',
  unban = 'unban',
}

export enum ModerationStatus {
  active = 'active',
  reversed = 'reversed',
}

export class Moderation {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  userId: number;

  @ApiProperty({
    type: Number,
    nullable: true,
  })
  reportId?: number | null;

  @ApiProperty({
    enum: ModerationActionType,
  })
  actionType: ModerationActionType;

  @ApiProperty({
    enum: ModerationStatus,
  })
  status: ModerationStatus;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}