import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusEntity } from '@statuses/infrastructure/persistence/relational/entities/status.entity';
import { StatusEnum } from '@statuses/statuses.enum';

@Injectable()
export class StatusSeedService {
  constructor(
    @InjectRepository(StatusEntity)
    private repository: Repository<StatusEntity>,
  ) {}

  async run() {
    const statuses = [
      {
        id: StatusEnum.active,
        name: 'Active',
      },
      {
        id: StatusEnum.inactive,
        name: 'Inactive',
      },
      {
        id: StatusEnum.under_warning,
        name: 'Under Warning',
      },
    ];

    for (const status of statuses) {
      const existingStatus = await this.repository.findOne({
        where: { id: status.id },
      });

      if (!existingStatus) {
        await this.repository.save(this.repository.create(status));
      }
    }
  }
}
