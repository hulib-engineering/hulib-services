import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NullableType } from '@utils/types/nullable.type';

import { TimeSlotRepository } from '../../time-slot.repository';
import { TimeSlot } from '../../../../domain/time-slot';
import { TimeSlotEntity } from '../entities/tims-slot.entity';
import { TimeSlotMapper } from '../mappers/time-slot.mapper';

@Injectable()
export class TimeSlotRelationalRepository implements TimeSlotRepository {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
  ) {}

  async create(data: TimeSlot): Promise<TimeSlot> {
    const persistenceModel = TimeSlotMapper.toPersistence(data);
    const newEntity = await this.timeSlotRepository.save(
      this.timeSlotRepository.create(persistenceModel),
    );
    return TimeSlotMapper.toDomain(newEntity);
  }

  async findAll(): Promise<TimeSlot[]> {
    const entities = await this.timeSlotRepository.find();
    const stories = entities.map((entity) => TimeSlotMapper.toDomain(entity));

    return stories;
  }

  async findById(id: TimeSlot['id']): Promise<NullableType<TimeSlot>> {
    const entity = await this.timeSlotRepository.findOne({
      where: { id },
    });

    return entity ? TimeSlotMapper.toDomain(entity) : null;
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

  async update(id: TimeSlot['id'], data: TimeSlot): Promise<TimeSlot> {
    const entity = await this.timeSlotRepository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`TimeSlot with id ${id} not found`);
    }
    entity.dayOfWeek = data.dayOfWeek;
    entity.startTime = data.startTime;
    await this.timeSlotRepository.save(entity);
    return TimeSlotMapper.toDomain(entity);
  }
}
