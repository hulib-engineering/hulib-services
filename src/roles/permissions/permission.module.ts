import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEnity } from './entities/permissions.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEnity])],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
