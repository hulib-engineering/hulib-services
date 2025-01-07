import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceEntity } from './infrastructure/persistence/relational/entities/resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
  ) {}

  async findAll(): Promise<ResourceEntity[]> {
    return this.resourceRepository.find();
  }

  async create(resourceData: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource = this.resourceRepository.create(resourceData);
    return this.resourceRepository.save(resource);
  }
}
