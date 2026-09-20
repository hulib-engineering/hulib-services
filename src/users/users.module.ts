import { Module } from '@nestjs/common';

import { UsersController } from '@users/users.controller';

import { UsersService } from '@users/users.service';
import { UserRepository } from '@users/user.repository';
import { FilesModule } from '@files/files.module';
import { CaslModule } from '@permission/casl.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [FilesModule, CaslModule, NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
