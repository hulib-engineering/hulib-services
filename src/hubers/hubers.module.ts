import { Module } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { UsersModule } from '@users/users.module';

import { ReportsModule } from '../reports/reports.module';

import { HubersService } from './hubers.service';
import { HubersController } from './hubers.controller';

@Module({
  imports: [HubersModule, UsersModule, ReportsModule],
  controllers: [HubersController],
  providers: [HubersService, PrismaService],
  exports: [HubersService],
})
export class HubersModule {}
