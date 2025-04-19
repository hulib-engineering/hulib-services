import { Module } from '@nestjs/common';
import { HubersService } from './hubers.service';
import { HubersController } from './hubers.controller';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [HubersModule, UsersModule],
  controllers: [HubersController],
  providers: [HubersService, PrismaService],
  exports: [HubersService],
})
export class HubersModule {}
