import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionEnity } from '../../../../roles/permissions/infrastructure/persistence/relational/entities/permissions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class permissionsSeedService {
  constructor(
    @InjectRepository(PermissionEnity)
    private repository: Repository<PermissionEnity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      await this.repository.save(this.repository.create({}));
    }
  }
}
