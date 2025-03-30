import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NullableType } from '@utils/types/nullable.type';
import { PrismaService } from '@prisma-client/prisma-client.service';

import { TimeSlotRepository } from '../../time-slot.repository';
import { TimeSlot } from '../../../../domain/time-slot';
import { TimeSlotEntity } from '../entities/tims-slot.entity';
import { TimeSlotMapper } from '../mappers/time-slot.mapper';
import { User } from '../../../../../users/domain/user';

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
      user,
    });
    const newEntity = await this.timeSlotRepository.save(
      this.timeSlotRepository.create(persistenceModel),
    );
    return TimeSlotMapper.toDomain(newEntity);
  }

  async createMany(data: TimeSlot[], user: User): Promise<TimeSlot[]> {
    return await this.prisma.$transaction(async (tx) => {
      await tx.timeSlots.deleteMany({
        where: {
          userId: Number(user.id),
        },
      });

      await tx.timeSlots.createMany({
        data: data.map((timeSlot) => ({
          ...timeSlot,
        })),
      });

      const timeSlotEntities = await tx.timeSlots.findMany({
        where: {
          userId: Number(user.id),
        },
      });

      const domains = timeSlotEntities.map((timeSlot) => {
        return TimeSlotMapper.toDomain(timeSlot);
      });

      return domains;
    });
  }

  async findAll(): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find();
    const domains = entities.map((entity) => TimeSlotMapper.toDomain(entity));

    return domains;
  }

  async findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { id },
    });

    return entity ? TimeSlotMapper.toDomain(entity) : null;
  }

  async findByUser(userId: User['id']): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find({
      where: { userId: Number(userId) },
      relations: {
        user: true,
      },
    });
    const domains = entities.map((entity) => TimeSlotMapper.toDomain(entity));
    return domains;
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
    const stories = entities.map((entity) => TimeSlotMapper.toDomain(entity));

    return stories;
  }
}
