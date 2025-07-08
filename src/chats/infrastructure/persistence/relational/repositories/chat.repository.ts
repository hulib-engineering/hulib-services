import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { NullableType } from '@utils/types/nullable.type';
import { PrismaService } from '@prisma-client/prisma-client.service';

import { ChatRepository } from '../../chat.repository';
import { Chat, ChatStatus } from '@chats/domain/chat';
import { ChatEntity } from '../entities/chat.entity';
import { ChatMapper } from '../mappers/chat.mapper';
import { User } from '@users/domain/user';

@Injectable()
export class ChatRelationalRepository implements ChatRepository {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: Chat, sender: User, recipient: User): Promise<Chat> {
    const persistenceModel = ChatMapper.toPersistence({
      ...data,
      sender: sender,
      recipient: recipient,
    });
    const newEntity = await this.chatRepository.save(
      this.chatRepository.create(persistenceModel),
    );
    return ChatMapper.toDomain(newEntity);
  }

  async findByUser(userId: User['id']): Promise<Chat[]> {
    const entities = await this.chatRepository.find({
      where: [
        { senderId: Number(userId), status: Not(ChatStatus.DELETED) },
        { recipientId: Number(userId), status: Not(ChatStatus.DELETED) },
      ],
      relations: {
        sender: {
          photo: true,
          role: true,
        },
        recipient: {
          photo: true,
          role: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return entities.map((entity) => ChatMapper.toDomain(entity));
  }

  async findByUsers(user1: User['id'], user2: User['id']): Promise<Chat[]> {
    const entities = await this.chatRepository.find({
      where: [
        {
          senderId: Number(user1),
          recipientId: Number(user2),
          status: Not(ChatStatus.DELETED),
        },
        {
          senderId: Number(user2),
          recipientId: Number(user1),
          status: Not(ChatStatus.DELETED),
        },
      ],
      relations: {
        sender: {
          photo: true,
          role: true,
        },
        recipient: {
          photo: true,
          role: true,
        },
        sticker: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return entities.map((entity) => ChatMapper.toDomain(entity));
  }

  async findById(id: Chat['id']): Promise<NullableType<Chat>> {
    const entity = await this.chatRepository.findOne({
      where: { id: Number(id), status: Not(ChatStatus.DELETED) },
      relations: {
        sender: {
          photo: true,
          role: true,
        },
        recipient: {
          photo: true,
          role: true,
        },
      },
    });

    if (!entity) {
      return null;
    }

    return ChatMapper.toDomain(entity);
  }

  async update(data: Chat): Promise<Chat> {
    const entity = ChatMapper.toPersistence(data);
    await this.chatRepository.update(data.id, entity);

    return data;
  }
}
