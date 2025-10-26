import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from '@mail/mail.service';
import { MailerModule } from '@mailer/mailer.module';
import { MailSchedulerService } from '@mail/mail-scheduler.service';

@Module({
  imports: [ConfigModule, MailerModule],
  providers: [MailService, MailSchedulerService],
  exports: [MailService, MailSchedulerService],
})
export class MailModule {}
