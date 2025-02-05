import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenderSeedService } from './gender-seed.service';
import { GenderEntity } from '@genders/infrastructure/persistence/relational/entities/gender.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GenderEntity])],
  providers: [GenderSeedService],
  exports: [GenderSeedService],
})
export class GenderSeedModule {}
