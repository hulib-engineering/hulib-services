import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/domain/user';
import { CreateChatDto } from '../dto/create-chat.dto';
import { ChatType } from '@chat-types/domain/chat-type';
import { Sticker } from '../../stickers/domain/sticker';

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
    type: () => ChatType,
  })
  chatType?: ChatType | null;

  @ApiProperty({
    type: () => Sticker,
  })
  sticker?: Sticker | null;

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
  readAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(createChatDto?: CreateChatDto) {
    this.message = createChatDto?.message ?? '';
    this.recipientId = createChatDto?.recipientId ?? 0;
  }
}
