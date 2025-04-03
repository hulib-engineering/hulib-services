import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@users/domain/user';

import {
  CreateTimeSlotDto,
  CreateTimeSlotsDto,
} from './dto/create-time-slot.dto';
import { TimeSlotRepository } from './infrastructure/persistence/time-slot.repository';
import { TimeSlot } from './domain/time-slot';
import { UsersService } from '@users/users.service';

@Injectable()
export class TimeSlotService {
  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly userService: UsersService,
  ) {}

  async create(createTimeSlotDto: CreateTimeSlotDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const timeSlot = new TimeSlot(createTimeSlotDto);
    timeSlot.huberId = userId;

    return this.timeSlotRepository.create(timeSlot, user);
  }

  async createMany(createTimeSlotsDto: CreateTimeSlotsDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const timeSlots = createTimeSlotsDto.timeSlots.map((createTimeSlotDto) => {
      const timeSlot = new TimeSlot(createTimeSlotDto);
      timeSlot.huberId = userId;
      return timeSlot;
    });

    return this.timeSlotRepository.createMany(timeSlots, user);
  }

  findAll() {
    return this.timeSlotRepository.findAll();
  }

  async findByHuber(userId: User['id']): Promise<TimeSlot[]> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return this.timeSlotRepository.findByUser(userId);
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
    const timeSlot = await this.findOne(id);

    if (!timeSlot) {
      throw new NotFoundException(`Time slot with id ${id} not found`);
    }

    const existingTimeSlot = await this.timeSlotRepository.findByTime(
      updateTimeSlotDto.dayOfWeek,
      updateTimeSlotDto.startTime,
    );
    if (existingTimeSlot && existingTimeSlot.id !== id) {
      throw new ConflictException(
        `Time slot with dayOfWeek ${updateTimeSlotDto.dayOfWeek} and startTime ${updateTimeSlotDto.startTime} already exists`,
      );
    }

    return this.timeSlotRepository.update({
      ...timeSlot,
      ...updateTimeSlotDto,
    });
  }

  findByDayOfWeek(dayOfWeek: TimeSlot['dayOfWeek']) {
    const timeSlot = this.timeSlotRepository.findByDayOfWeek(dayOfWeek);

    if (!timeSlot) {
      throw new NotFoundException(
        `Time slot with dayOfWeek ${dayOfWeek} not found`,
      );
    }

    return timeSlot;
  }
}
