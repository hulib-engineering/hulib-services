import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { notificationEntity } from '../../../../notifications/infrastructure/persistence/relational/entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class notificationSeedService {
  constructor(
    @InjectRepository(notificationEntity)
    private repository: Repository<notificationEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      await this.repository.save(this.repository.create({}));
    }
  }
}
