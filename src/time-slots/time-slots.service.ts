import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { TimeSlotRepository } from './infrastructure/persistence/time-slot.repository';
import { TimeSlot } from './domain/time-slot';

@Injectable()
export class TimeSlotService {
  constructor(private readonly timeSlotRepository: TimeSlotRepository) {}

  async create(createStoriesDto: CreateTimeSlotDto) {
    const existingTimeSlot = await this.timeSlotRepository.findByTime(
      createStoriesDto.dayOfWeek,
      createStoriesDto.startTime,
    );
    if (existingTimeSlot) {
      throw new ConflictException(
        `Time slot with dayOfWeek ${createStoriesDto.dayOfWeek} and startTime ${createStoriesDto.startTime} already exists`,
      );
    }

    if ((createStoriesDto.startTime * 60) % 30 !== 0) {
      throw new ConflictException(
        `Time slot with startTime ${createStoriesDto.startTime} must be a multiple of 30 minutes`,
      );
    }
    return this.timeSlotRepository.create({ ...createStoriesDto });
  }

  findAll() {
    return this.timeSlotRepository.findAll();
  }

  async findOne(id: TimeSlot['id']) {
    const timeSlot = await this.timeSlotRepository.findById(id);
    if (!timeSlot) {
      throw new NotFoundException(`Time slot with id ${id} not found`);
    }
    return timeSlot;
  }

  remove(id: TimeSlot['id']) {
    return this.timeSlotRepository.remove(id);
  }

  async update(id: TimeSlot['id'], updateTimeSlotDto: CreateTimeSlotDto) {
    const existingTimeSlot = await this.timeSlotRepository.findById(id);

    if (!existingTimeSlot) {
      throw new NotFoundException(`Time slot with id ${id} not found`);
    }

    return this.timeSlotRepository.update(id, updateTimeSlotDto);
  }
}
