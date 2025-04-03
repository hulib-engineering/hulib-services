import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NullableType } from '@utils/types/nullable.type';
import { PrismaService } from '@prisma-client/prisma-client.service';

import { TimeSlotRepository } from '../../time-slot.repository';
import { TimeSlot } from '../../../../domain/time-slot';
import { TimeSlotEntity } from '../entities/tims-slot.entity';
import { TimeSlotMapper } from '../mappers/time-slot.mapper';
import { User } from '@users/domain/user';

@Injectable()
export class TimeSlotRelationalRepository implements TimeSlotRepository {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: TimeSlot, user: User): Promise<TimeSlot> {
    const persistenceModel = TimeSlotMapper.toPersistence({
      ...data,
      huber: user,
    });
    const newEntity = await this.timeSlotRepository.save(
      this.timeSlotRepository.create(persistenceModel),
    );
    return TimeSlotMapper.toDomain(newEntity);
  }

  async createMany(data: TimeSlot[], user: User): Promise<TimeSlot[]> {
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
        return TimeSlotMapper.toDomain(timeSlot);
      });
    });
  }

  async findAll(): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find();
    return entities.map((entity) => TimeSlotMapper.toDomain(entity));
  }

  async findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { id },
    });

    return entity ? TimeSlotMapper.toDomain(entity) : null;
  }

  async findByUser(userId: User['id']): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find({
      where: { huberId: Number(userId) },
      relations: {
        huber: true,
      },
    });
    return entities.map((entity) => TimeSlotMapper.toDomain(entity));
  }

  async findByTime(
    dayOfWeek: TimeSlot['dayOfWeek'],
    startTime: TimeSlot['startTime'],
  ): Promise<NullableType<TimeSlot>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { dayOfWeek, startTime },
    });

    return entity ? TimeSlotMapper.toDomain(entity) : null;
  }

  async remove(id: TimeSlot['id']): Promise<void> {
    await this.timeSlotRepository.delete(id);
  }

  async update(data: TimeSlot): Promise<TimeSlot> {
    const entity = TimeSlotMapper.toPersistence(data);
    await this.timeSlotRepository.update(data.id, entity);

    return data;
  }

  async findByDayOfWeek(dayOfWeek: TimeSlot['dayOfWeek']): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find({
      where: { dayOfWeek },
    });
    return entities.map((entity) => TimeSlotMapper.toDomain(entity));
  }
}
