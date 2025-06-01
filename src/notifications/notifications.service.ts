import { Injectable } from '@nestjs/common';
import { CreatenotificationDto } from './dto/create-notification.dto';
import { UpdatenotificationDto } from './dto/update-notification.dto';
import { notificationRepository } from './infrastructure/persistence/notification.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { notification } from './domain/notification';

@Injectable()
export class notificationsService {
  constructor(
    private readonly notificationRepository: notificationRepository,
  ) {}

  create(createnotificationDto: CreatenotificationDto) {
    return this.notificationRepository.create(createnotificationDto);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.notificationRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findOne(id: notification['id']) {
    return this.notificationRepository.findById(id);
  }

  update(id: notification['id'], updatenotificationDto: UpdatenotificationDto) {
    return this.notificationRepository.update(id, updatenotificationDto);
  }

  remove(id: notification['id']) {
    return this.notificationRepository.remove(id);
  }
}
