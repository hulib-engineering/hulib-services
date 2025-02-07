import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma-client.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
