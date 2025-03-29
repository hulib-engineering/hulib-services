import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma-client/prisma-client.service';

@Injectable()
export class TimeSlotSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const count = await this.prisma.timeSlots.count();
    if (count === 0) {
      const user = await this.prisma.user.findFirst();
      for (let i = 0; i < 7; i++) {
        for (let j = 6; j < 24; j += 0.5) {
          const hours = Math.floor(j);
          const minutes = (j % 1) * 60;

          const timeString = `${String(hours).padStart(2, '0')}:${String(Math.round(minutes)).padStart(2, '0')}:00`;

          await this.prisma.timeSlots.create({
            data: {
              userId: user?.id ?? 0,
              dayOfWeek: i,
              startTime: timeString,
            },
          });
        }
      }
    }
  }
}
