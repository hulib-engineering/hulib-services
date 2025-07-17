import { Module } from '@nestjs/common';

import { UsersController } from '@users/users.controller';

import { UsersService } from '@users/users.service';
import { RelationalUserPersistenceModule } from '@users/infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '@files/files.module';
import { CaslModule } from '@casl/casl.module';
import { NotificationsModule } from '../notifications/notifications.module';

const infrastructurePersistenceModule = RelationalUserPersistenceModule;

@Module({
  imports: [
    infrastructurePersistenceModule,
    FilesModule,
    CaslModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
