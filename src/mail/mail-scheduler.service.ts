import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from '@prisma-client/prisma-client.service';
import { MailService } from "./mail.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RoleEnum } from "../roles/roles.enum";
import { StatusEnum } from "../statuses/statuses.enum";


@Injectable()
export class MailSchedulerService {
  private readonly logger = new Logger(MailSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async sendUploadStoryRemiderLibers() {
    this.logger.log('Starting to send upload story reminders to Libers...');
    const libers = await this.prisma.user.findMany({
      where: {
        roleId: RoleEnum.reader,
        statusId: StatusEnum.active,
        email: { 
          not: null,
        },
      },
    });

    for (const liber of libers) {
      try {
        if (liber.email) {
          await this.mailService.sendUploadStoryReminderEmailLiber({
            to: liber.email,
            data: {
              fullName: liber.fullName || 'Liber',
            },
          });
          this.logger.log(`Upload story reminder sent to Email: ${liber.email}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send upload story reminder to Email: ${liber.email}`, error.stack);
      }
    }

    this.logger.log('Finished sending upload story reminders to Libers.');
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async sendUploadStoryRemiderHubers() {
    this.logger.log('Starting to send upload story reminders to Hubers...');
    const hubers = await this.prisma.user.findMany({
      where: {
        roleId: RoleEnum.humanBook,
        statusId: StatusEnum.active,
        email: { 
          not: null,
        },
      },
    });

    for (const huber of hubers) {
      try {
        if (huber.email) {
          await this.mailService.sendUploadStoryReminderEmailHuber({
            to: huber.email,
            data: {
              fullName: huber.fullName || 'Huber',
            },
          });
          this.logger.log(`Upload story reminder sent to Email: ${huber.email}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send upload story reminder to Email: ${huber.email}`, error.stack);
      }
    }

    this.logger.log('Finished sending upload story reminders to Hubers.');
  }
}