import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { Message } from '../../../../domain/message';
import { MessageMapper } from '../mappers/messages.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
  ) {}

  async create(domain: Message): Promise<Message> {
    const entity = MessageMapper.toPersistence(domain);
    const newEntity = await this.repository.save(entity);
    return MessageMapper.toDomain(newEntity);
  }

  async findById(id: number): Promise<Message | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['readingSession', 'humanBook', 'reader'],
    });
    return entity ? MessageMapper.toDomain(entity) : null;
  }

  async findByReadingSessionId(readingSessionId: number): Promise<Message[]> {
    const entities = await this.repository.find({
      where: { readingSessionId },
      relations: ['readingSession', 'humanBook', 'reader'],
    });
    return entities.map((entity) => MessageMapper.toDomain(entity));
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: any;
    paginationOptions: IPaginationOptions;
  }): Promise<Message[]> {
    const where: FindOptionsWhere<MessageEntity> = {};

    if (filterOptions?.readingSessionId) {
      where.readingSessionId = filterOptions.readingSessionId;
    }

    if (filterOptions?.humanBookId) {
      where.humanBookId = filterOptions.humanBookId;
    }

    if (filterOptions?.readerId) {
      where.readerId = filterOptions.readerId;
    }

    const entities = await this.repository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations: ['readingSession', 'humanBook', 'reader'],
    });

    return entities.map((entity) => MessageMapper.toDomain(entity));
  }

  async update(id: number, domain: Partial<Message>): Promise<Message> {
    const entity = MessageMapper.toPersistence(domain as Message);
    await this.repository.update(id, entity);
    const updated = await this.repository.findOne({ where: { id } });

    if (!updated) {
      throw new Error('Message not found');
    }

    return MessageMapper.toDomain(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
