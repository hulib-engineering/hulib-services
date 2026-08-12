import { Module } from '@nestjs/common';
import { UserRepository } from '@users/infrastructure/persistence/user.repository';
import { UsersRelationalRepository } from './repositories/user.repository';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    {
      provide: UserRepository,
      useClass: UsersRelationalRepository,
    },
    UserProfileRepository,
  ],
  exports: [UserRepository, UserProfileRepository],
})
export class RelationalUserPersistenceModule {}
