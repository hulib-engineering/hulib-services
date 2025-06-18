import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@users/domain/user';

import {
  CreateChatDto,
  CreateChatsDto,
} from './dto/create-chat.dto';
import { ChatRepository } from './infrastructure/persistence/chat.repository';
import { Chat } from './domain/chat';
import { UsersService } from '@users/users.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class ChatService {
  constructor(
    private readonly timeSlotRepository: ChatRepository,
    private readonly userService: UsersService,
  ) {}

  async create(createTimeSlotDto: CreateChatDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
      throw new NotFoundException(`Huber with id ${userId} not found`);
    }

    const timeSlot = new Chat(createTimeSlotDto);
    timeSlot.huberId = userId;

    return this.timeSlotRepository.create(timeSlot, user);
  }

  async createMany(createTimeSlotsDto: CreateChatsDto, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
      throw new NotFoundException(`Huber with id ${userId} not found`);
    }
    const timeSlots = createTimeSlotsDto.timeSlots.map((createTimeSlotDto) => {
      const timeSlot = new Chat(createTimeSlotDto);
      timeSlot.huberId = userId;
      return timeSlot;
    });

    return this.timeSlotRepository.createMany(timeSlots, user);
  }

  async findAll(userId: User['id']): Promise<Chat[]> {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return this.timeSlotRepository.findByUser(userId);
  }

  async findByHuber(userId: User['id']): Promise<Chat[]> {
    const user = await this.userService.findById(userId);
    if (!user || user.role?.id != RoleEnum.humanBook) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return this.timeSlotRepository.findByUser(userId);
  }

  async findOne(id: Chat['id']) {
    const timeSlot = await this.timeSlotRepository.findById(id);
    if (!timeSlot) {
      throw new NotFoundException(`Time slot with id ${id} not found`);
    }
    return timeSlot;
  }

  remove(id: Chat['id']) {
    return this.timeSlotRepository.remove(id);
  }

  async update(id: Chat['id'], updateTimeSlotDto: CreateChatDto) {
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

  findByDayOfWeek(dayOfWeek: Chat['dayOfWeek']) {
    const timeSlot = this.timeSlotRepository.findByDayOfWeek(dayOfWeek);

    if (!timeSlot) {
      throw new NotFoundException(
        `Time slot with dayOfWeek ${dayOfWeek} not found`,
      );
    }

    return timeSlot;
  }
}
