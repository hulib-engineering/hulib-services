import { Module } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { UsersModule } from '@users/users.module';

import { HubersService } from './hubers.service';
import { HubersController } from './hubers.controller';

@Module({
  imports: [HubersModule, UsersModule],
  controllers: [HubersController],
  providers: [HubersService, PrismaService],
  exports: [HubersService],
})
export class HubersModule {}
