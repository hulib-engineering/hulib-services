import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/domain/user';
import { CreateChatDto } from '../dto/create-chat.dto';

const idType = Number;

export enum ChatStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  DELETED = 'deleted',
}

export class Chat {
  @ApiProperty({
    type: idType,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'hi',
  })
  message: string;

  @ApiProperty({
    type: Number,
  })
  senderId: number;

  @ApiProperty({
    type: () => User,
  })
  sender: User;

  @ApiProperty({
    type: Number,
  })
  recipientId: number;

  @ApiProperty({
    type: () => User,
  })
  recipient: User;

  @ApiProperty({
    enum: ChatStatus,
    enumName: 'ChatStatus',
  })
  status: ChatStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(createChatDto?: CreateChatDto) {
    this.message = createChatDto?.message ?? '';
    this.recipientId = createChatDto?.recipientId ?? 0;
  }
}
