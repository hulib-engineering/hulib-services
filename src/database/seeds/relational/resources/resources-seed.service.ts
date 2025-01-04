import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceEntity } from '../../../../roles/resources/entities/resource.entity';
import { Repository } from 'typeorm';

@Injectable()
export class resourcesSeedService {
  constructor(
    @InjectRepository(ResourceEntity)
    private repository: Repository<ResourceEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      await this.repository.save(this.repository.create({}));
    }
  }
}
