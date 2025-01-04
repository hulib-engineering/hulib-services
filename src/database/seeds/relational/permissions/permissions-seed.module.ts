import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEnity } from '../../../../roles/permissions/entities/permissions.entity';
import { permissionsSeedService } from './permissions-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEnity])],
  providers: [permissionsSeedService],
  exports: [permissionsSeedService],
})
export class permissionsSeedModule {}
