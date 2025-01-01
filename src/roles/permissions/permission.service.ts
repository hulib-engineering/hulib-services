import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEnity } from './entities/permissions.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEnity)
    private readonly permissionRepository: Repository<PermissionEnity>,
  ) {}

  async findAll(): Promise<PermissionEnity[]> {
    return this.permissionRepository.find();
  }

  async create(
    permissionData: Partial<PermissionEnity>,
  ): Promise<PermissionEnity> {
    const permission = this.permissionRepository.create(permissionData);
    return this.permissionRepository.save(permission);
  }
}
