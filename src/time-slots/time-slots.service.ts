import {
  ConflictException,
  ForbiddenException,
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
import { RoleEnum } from '../roles/roles.enum';
import { Approval } from '../users/approval.enum';

@Injectable()
export class TimeSlotService {
  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly userService: UsersService,
  ) {}

  private getDayName(dayOfWeek: number): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayOfWeek] || `Day ${dayOfWeek}`;
  }

  private checkForDuplicatesInRequest(timeSlots: CreateTimeSlotDto[]): void {
    const seenTimeSlots = new Set<string>();

    for (const timeSlot of timeSlots) {
      const timeSlotKey = `${timeSlot.dayOfWeek}-${timeSlot.startTime}`;

      if (seenTimeSlots.has(timeSlotKey)) {
        throw new ConflictException(
          `Duplicate time slot found: ${this.getDayName(timeSlot.dayOfWeek)} at ${timeSlot.startTime}`,
        );
      }

      seenTimeSlots.add(timeSlotKey);
    }
  }

  private checkForConflictsWithExisting(
    newTimeSlots: CreateTimeSlotDto[],
    existingTimeSlots: TimeSlot[],
  ): void {
    const existingKeys = new Set<string>();
    for (const existing of existingTimeSlots) {
      existingKeys.add(`${existing.dayOfWeek}-${existing.startTime}`);
    }

    for (const newTimeSlot of newTimeSlots) {
      const newKey = `${newTimeSlot.dayOfWeek}-${newTimeSlot.startTime}`;

      if (existingKeys.has(newKey)) {
        throw new ConflictException(
          `Time slot already exists for user: ${this.getDayName(newTimeSlot.dayOfWeek)} at ${newTimeSlot.startTime}`,
        );
      }
    }
  }

  async create(createTimeSlotDto: CreateTimeSlotDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
      throw new NotFoundException(`Huber with id ${userId} not found`);
    }

    const existingTimeSlots = await this.timeSlotRepository.findByUser(userId);
    const conflictingSlot = existingTimeSlots.find(
      (slot) =>
        slot.dayOfWeek === createTimeSlotDto.dayOfWeek &&
        slot.startTime === createTimeSlotDto.startTime,
    );

    if (conflictingSlot) {
      throw new ConflictException(
        `Time slot already exists for user: ${this.getDayName(createTimeSlotDto.dayOfWeek)} at ${createTimeSlotDto.startTime}`,
      );
    }

    const timeSlot = new TimeSlot(createTimeSlotDto);
    timeSlot.huberId = userId;

    return this.timeSlotRepository.create(timeSlot, user);
  }

  async createMany(createTimeSlotsDto: CreateTimeSlotsDto, userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException();
    }
    const acceptableRole =
      user.role.id === RoleEnum.humanBook ||
      (user.role.id === RoleEnum.reader && user.approval === Approval.pending);
    if (!acceptableRole) {
      throw new ForbiddenException();
    }

    this.checkForDuplicatesInRequest(createTimeSlotsDto.timeSlots);

    const existingTimeSlots = await this.timeSlotRepository.findByUser(userId);
    this.checkForConflictsWithExisting(
      createTimeSlotsDto.timeSlots,
      existingTimeSlots,
    );

    const timeSlots = createTimeSlotsDto.timeSlots.map((createTimeSlotDto) => {
      const timeSlot = new TimeSlot(createTimeSlotDto);
      timeSlot.huberId = userId;
      return timeSlot;
    });

    return this.timeSlotRepository.createMany(timeSlots, user);
  }

  async findAll(userId: User['id']): Promise<TimeSlot[]> {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return this.timeSlotRepository.findByUser(userId);
  }

  async findByHuber(userId: User['id']): Promise<TimeSlot[]> {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
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
        `Time slot with ${this.getDayName(updateTimeSlotDto.dayOfWeek)} at ${updateTimeSlotDto.startTime} already exists`,
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
