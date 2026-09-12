import { Module } from '@nestjs/common';
import { UserRepository } from '@users/infrastructure/persistence/user.repository';
import { UserRepositoryImplement } from './repositories/user-prisma.repository';

// Users' own repository binding is Prisma-backed. UserEntity (TypeORM) and
// related TypeORM artifacts still exist in this folder because the seed
// scripts import them; the runtime persistence layer no longer uses TypeORM.
@Module({
  providers: [
    UserRepositoryImplement,
    {
      provide: UserRepository,
      useExisting: UserRepositoryImplement,
    },
  ],
  exports: [UserRepository],
})
export class RelationalUserPersistenceModule {}
