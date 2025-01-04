import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceEntity } from '../../../../roles/resources/entities/resource.entity';
import { resourcesSeedService } from './resources-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceEntity])],
  providers: [resourcesSeedService],
  exports: [resourcesSeedService],
})
export class resourcesSeedModule {}
