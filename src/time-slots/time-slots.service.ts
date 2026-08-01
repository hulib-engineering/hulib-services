import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
import { PrismaService } from '@prisma-client/prisma-client.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

@Injectable()
export class TimeSlotService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
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

    const incomingTimeSlots = new Set(
      createTimeSlotsDto.timeSlots.map(
        (timeSlot) => `${timeSlot.dayOfWeek}-${timeSlot.startTime}`,
      ),
    );
    const existingTimeSlots = await this.timeSlotRepository.findByUser(userId);
    const existingTimeSlotsKeys = new Set(
      existingTimeSlots.map(
        (timeSlot) => `${timeSlot.dayOfWeek}-${timeSlot.startTime}`,
      ),
    );
    if (
      incomingTimeSlots.size === existingTimeSlotsKeys.size &&
      [...incomingTimeSlots].every((key) => existingTimeSlotsKeys.has(key))
    ) {
      throw new HttpException('Not Modified', HttpStatus.NOT_MODIFIED);
    }

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

  @Cron('0 0 * * *', { timeZone: 'UTC' }) // Once a day at 00:00 UTC
  async remindHubersToSetupCalendar() {
    const hubersWithoutSlots = await this.prisma.user.findMany({
      where: {
        roleId: RoleEnum.humanBook,
        huberSince: { not: null },
        timeSlots: { none: {} },
      },
      select: { id: true },
    });

    if (hubersWithoutSlots.length === 0) {
      return;
    }

    const adminId = await this.notificationsService.getAdminId();
    if (!adminId) {
      return;
    }

    this.logger.log(
      `[CRON] Found ${hubersWithoutSlots.length} huber(s) without meeting availability set up`,
    );

    // Nag weekly rather than every run, until the huber sets up a slot.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const huber of hubersWithoutSlots) {
      const recentReminder = await this.prisma.notification.findFirst({
        where: {
          type: { name: NotificationTypeEnum.calendarReminder },
          recipientId: huber.id,
          createdAt: { gte: sevenDaysAgo },
        },
      });

      if (recentReminder) {
        continue;
      }

      await this.notificationsService.pushNoti({
        senderId: adminId,
        recipientId: huber.id,
        type: NotificationTypeEnum.calendarReminder,
      });
    }
  }
}
