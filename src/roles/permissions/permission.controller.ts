import { Controller, Get, Post, Body } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionEnity } from './entities/permissions.entity';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async getAllPermissions(): Promise<PermissionEnity[]> {
    return this.permissionService.findAll();
  }

  @Post()
  async createPermission(
    @Body() body: Partial<PermissionEnity>,
  ): Promise<PermissionEnity> {
    return this.permissionService.create(body);
  }
}
