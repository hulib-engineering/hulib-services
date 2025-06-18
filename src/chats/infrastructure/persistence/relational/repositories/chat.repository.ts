import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NullableType } from '@utils/types/nullable.type';
import { PrismaService } from '@prisma-client/prisma-client.service';

import { ChatRepository } from '../../chat.repository';
import { Chat } from '../../../../domain/chat';
import { ChatEntity } from '../entities/chat.entity';
import { ChatMapper } from '../mappers/chat.mapper';
import { User } from '@users/domain/user';

@Injectable()
export class ChatRelationalRepository implements ChatRepository {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly timeSlotRepository: Repository<ChatEntity>,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: Chat, user: User): Promise<Chat> {
    const persistenceModel = ChatMapper.toPersistence({
      ...data,
      huber: user,
    });
    const newEntity = await this.timeSlotRepository.save(
      this.timeSlotRepository.create(persistenceModel),
    );
    return ChatMapper.toDomain(newEntity);
  }

  async createMany(data: Chat[], user: User): Promise<Chat[]> {
    return this.prisma.$transaction(async (tx) => {
      await tx.timeSlot.deleteMany({
        where: {
          huberId: Number(user.id),
        },
      });

      await tx.timeSlot.createMany({
        data: data.map((timeSlot) => ({
          dayOfWeek: timeSlot.dayOfWeek,
          startTime: timeSlot.startTime,
          huberId: Number(user.id),
        })),
      });

      const timeSlotEntities = await tx.timeSlot.findMany({
        where: {
          huberId: Number(user.id),
        },
      });

      return timeSlotEntities.map((timeSlot) => {
        return ChatMapper.toDomain(timeSlot);
      });
    });
  }

  async findAll(): Promise<Chat[]> {
    const entities = await this.timeSlotRepository.find();
    return entities.map((entity) => ChatMapper.toDomain(entity));
  }

  async findById(id: Chat['id']): Promise<NullableType<Chat>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { id },
    });

    return entity ? ChatMapper.toDomain(entity) : null;
  }

  async findByUser(userId: User['id']): Promise<Chat[]> {
    const entities = await this.timeSlotRepository.find({
      where: { huberId: Number(userId) },
      relations: {
        huber: true,
      },
    });
    return entities.map((entity) => ChatMapper.toDomain(entity));
  }

  async findByTime(
    dayOfWeek: Chat['dayOfWeek'],
    startTime: Chat['startTime'],
  ): Promise<NullableType<Chat>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { dayOfWeek, startTime },
    });

    return entity ? ChatMapper.toDomain(entity) : null;
  }

  async remove(id: Chat['id']): Promise<void> {
    await this.timeSlotRepository.delete(id);
  }

  async update(data: Chat): Promise<Chat> {
    const entity = ChatMapper.toPersistence(data);
    await this.timeSlotRepository.update(data.id, entity);

    return data;
  }

  async findByDayOfWeek(dayOfWeek: Chat['dayOfWeek']): Promise<Chat[]> {
    const entities = await this.timeSlotRepository.find({
      where: { dayOfWeek },
    });
    return entities.map((entity) => ChatMapper.toDomain(entity));
  }
}
