import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailService } from '@mail/mail.service';
import { MailerModule } from '@mailer/mailer.module';
import { MailSchedulerService } from '@mail/mail-scheduler.service';
import { MailProcessor } from '@mail/mail.processor';

@Module({
  imports: [ConfigModule, MailerModule, BullModule.registerQueue({ name: 'mail' })],
  providers: [MailService, MailSchedulerService, MailProcessor],
  exports: [MailService, MailSchedulerService, BullModule],
})
export class MailModule {}
