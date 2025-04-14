import { Module } from '@nestjs/common';
import { HuberRepository } from '../huber.repository';
import { HuberRelationalRepository } from './repositories/huber.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HuberEntity } from './entities/huber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HuberEntity])],
  providers: [
    {
      provide: HuberRepository,
      useClass: HuberRelationalRepository,
    },
  ],
  exports: [HuberRepository],
})
export class RelationalHuberPersistenceModule {}
