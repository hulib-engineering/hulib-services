import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client/prisma-client.service';
@Injectable()
export class ScheduleService {
  private prisma: PrismaService;

  async findAll() {
    return this.prisma.schedules.findMany({});
  }
}
