import { Controller, Get, Post, Body } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceEntity } from './infrastructure/persistence/relational/entities/resource.entity';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  async getAllResources(): Promise<ResourceEntity[]> {
    return this.resourceService.findAll();
  }

  @Post()
  async createResource(
    @Body() body: Partial<ResourceEntity>,
  ): Promise<ResourceEntity> {
    return this.resourceService.create(body);
  }
}
