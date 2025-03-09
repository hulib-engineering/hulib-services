import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client/prisma-client.service';
@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.schedules.findMany({
      include: {
        humanBook: true,
        userLiber: true,
      },
    });
  }
}
