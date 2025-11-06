import { ApiProperty } from '@nestjs/swagger';
import { Moderation } from '@moderations/domain/moderation';
import { User } from '@users/domain/user';

export enum AppealStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

export class Appeal {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  moderationId: number;

  @ApiProperty({
    type: () => Moderation,
  })
  moderation?: Moderation;

  @ApiProperty({
    type: Number,
  })
  userId: number;

  @ApiProperty({
    type: () => User,
  })
  user?: User;

  @ApiProperty({
    type: String,
  })
  message: string;

  @ApiProperty({
    enum: AppealStatus,
  })
  status: AppealStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
  })
  deletedAt: Date | null;
}
