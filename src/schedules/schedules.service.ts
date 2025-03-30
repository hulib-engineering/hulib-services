import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client/prisma-client.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    // const schedules = await this.prisma.schedules.findMany({
    //   include: {
    //     humanBook: {
    //       select: {
    //         id: true,
    //         email: true,
    //         provider: true,
    //         socialId: true,
    //         fullName: true,
    //         birthday: true,
    //         genderId: true,
    //         roleId: true,
    //         statusId: true,
    //         approval: true,
    //         photoId: true,
    //         address: true,
    //         parentPhoneNumber: true,
    //         phoneNumber: true,
    //         bio: true,
    //         videoUrl: true,
    //         education: true,
    //         educationStart: true,
    //         educationEnd: true,
    //       },
    //     },
    //     userLiber: {
    //       select: {
    //         id: true,
    //         email: true,
    //         provider: true,
    //         socialId: true,
    //         fullName: true,
    //         birthday: true,
    //         genderId: true,
    //         roleId: true,
    //         statusId: true,
    //         approval: true,
    //         photoId: true,
    //         address: true,
    //         parentPhoneNumber: true,
    //         phoneNumber: true,
    //         bio: true,
    //         videoUrl: true,
    //         education: true,
    //         educationStart: true,
    //         educationEnd: true,
    //       },
    //     },
    //   },
    // });
    // if (!schedules) {
    //   throw new UnprocessableEntityException({
    //     status: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: {
    //       user: 'schedulesNotFound',
    //     },
    //   });
    // }
    return {
      message: 'Success',
      status: 200,
    };
  }
}
